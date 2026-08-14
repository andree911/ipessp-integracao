'use strict';
/**
 * Mini-runtime do n8n, suficiente pra executar o Bot-IPESSP-WhatsApp fora do n8n.
 *
 * Cobre só o que o fluxo do bot usa de verdade:
 *  - expressões `={{ ... }}` (interpolação simples e valor bruto);
 *  - nós `code` (executados de verdade, direto do JSON do workflow);
 *  - nós `if` com os operadores string equals/exists/regex;
 *  - nós `httpRequest` (mockados: registram a chamada, devolvem o que o cenário mandar);
 *  - nós `agent` (mockados: registram o system prompt já resolvido e as tools ligadas).
 *
 * O que NÃO é simulado, de propósito: a resposta do modelo. O que dá pra afirmar
 * de forma determinística é o que CHEGA até ele -- categoria roteada, preâmbulo,
 * instruções e tools disponíveis -- e era exatamente aí que estavam quatro dos
 * cinco erros de contexto que motivaram esta suíte.
 */

/** Relógio injetável: os code nodes chamam Date.now(), e os TTLs precisam ser testáveis. */
function criarRelogio(inicio = Date.parse('2026-08-13T15:42:00-03:00')) {
  let agora = inicio;
  const Fake = new Proxy(Date, {
    construct: (alvo, args) => (args.length ? new alvo(...args) : new alvo(agora)),
    get: (alvo, prop) => (prop === 'now' ? () => agora : Reflect.get(alvo, prop)),
  });
  return {
    Date: Fake,
    avancar: (ms) => { agora += ms; },
    definir: (ts) => { agora = ts; },
    get agora() { return agora; },
    MINUTO: 60 * 1000,
    HORA: 60 * 60 * 1000,
  };
}

/**
 * Avalia o miolo de um `{{ ... }}` no contexto de um item.
 *
 * O acesso a propriedade de `undefined` devolve `undefined` em vez de estourar,
 * igual ao motor de expressões do n8n -- é disso que o fluxo depende no `If1`,
 * onde `$json.body.text.message` é lido justamente pra descobrir se a mensagem
 * TEM texto. Um runtime estrito quebraria todo o ramo de mídia.
 */
function avaliarExpressao(corpo, ctx) {
  const fn = new Function('$json', '$', '$env', '$now', `return (${corpo});`);
  try {
    return fn(ctx.json, ctx.$, ctx.$env, ctx.relogio.agora);
  } catch (e) {
    if (e instanceof TypeError) return undefined;
    throw e;
  }
}

/**
 * Resolve um valor de parâmetro do n8n. `=` marca expressão; se a string inteira
 * for um único `{{ ... }}`, devolve o valor bruto (objeto, número), senão
 * interpola dentro do texto.
 */
function resolver(valor, ctx) {
  if (typeof valor !== 'string' || !valor.startsWith('=')) return valor;
  const texto = valor.slice(1);
  const unico = texto.match(/^\s*\{\{([\s\S]*)\}\}\s*$/);
  if (unico) return avaliarExpressao(unico[1], ctx);
  return texto.replace(/\{\{([\s\S]*?)\}\}/g, (_, corpo) => String(avaliarExpressao(corpo, ctx)));
}

/** Implementa `$('Nome do Nó')` a partir do que já rodou neste turno. */
function criarAcessorDeNos(saidas) {
  return (nome) => {
    if (!(nome in saidas)) {
      throw new Error(`$('${nome}') foi lido antes do nó rodar -- ordem do fluxo mudou?`);
    }
    const itens = saidas[nome];
    return {
      first: () => itens[0],
      last: () => itens[itens.length - 1],
      all: () => itens,
      item: itens[0],
    };
  };
}

function avaliarCondicao(cond, ctx) {
  const esquerda = resolver(cond.leftValue, ctx);
  const { operation } = cond.operator;
  if (operation === 'exists') return esquerda !== undefined && esquerda !== null && esquerda !== '';
  if (operation === 'equals') return String(esquerda) === String(cond.rightValue);
  if (operation === 'regex') {
    const flags = ctx.node.parameters.options?.ignoreCase ? 'i' : '';
    return new RegExp(cond.rightValue, flags).test(String(esquerda ?? ''));
  }
  throw new Error(`operador não suportado no runtime de teste: ${operation}`);
}

/**
 * Executa um turno: entra pelo Webhook e caminha pelas conexões `main` até parar.
 * Devolve o rastro completo do turno pra suíte afirmar em cima.
 */
function executarTurno(wf, payload, opcoes = {}) {
  const { staticData = {}, relogio = criarRelogio(), mocks = {}, env = {} } = opcoes;

  const nos = Object.fromEntries(wf.nodes.map((n) => [n.name, n]));
  const saidas = {};
  const $ = criarAcessorDeNos(saidas);
  const $env = {
    INTEGRACAO_API_URL: 'http://integracao-service:3000',
    IPESSP_CORE_URL: 'http://ipessp-core:3000',
    IA_BEARER_TOKEN: 'token-ia',
    CORE_API_KEY: 'chave-admin',
    ZAPI_INSTANCE_ID: 'inst', ZAPI_TOKEN: 'tok', ZAPI_CLIENT_TOKEN: 'ctok',
    ...env,
  };

  const rastro = { nos: [], http: [], agente: null, categoria: null, ignorado: false };

  // tools e memória ligadas a cada agente, pra suíte checar o que ele tinha em mãos
  const ligacoes = {};
  for (const [origem, conns] of Object.entries(wf.connections)) {
    for (const [tipo, ramos] of Object.entries(conns)) {
      if (tipo === 'main') continue;
      for (const ramo of ramos || []) {
        for (const c of ramo || []) {
          (ligacoes[c.node] ||= {});
          ((ligacoes[c.node][tipo] ||= [])).push(origem);
        }
      }
    }
  }

  const proximos = (nome, ramo = 0) =>
    ((wf.connections[nome]?.main || [])[ramo] || []).map((c) => c.node);

  let fila = [{ nome: 'Webhook', itens: [{ json: payload }] }];
  let passos = 0;

  while (fila.length) {
    if (++passos > 100) throw new Error('loop infinito no fluxo de teste');
    const { nome, itens } = fila.shift();
    const node = nos[nome];
    if (!node) throw new Error(`nó inexistente no workflow: ${nome}`);

    const ctx = { json: itens[0]?.json, $, $env, relogio, node };
    rastro.nos.push(nome);

    let saida = itens;
    let ramo = 0;

    switch (node.type) {
      case 'n8n-nodes-base.webhook':
        break;

      case 'n8n-nodes-base.code': {
        const fn = new Function('$input', '$', '$getWorkflowStaticData', '$env', 'Date', node.parameters.jsCode);
        const $input = { first: () => itens[0], all: () => itens, last: () => itens[itens.length - 1] };
        saida = fn($input, $, () => staticData, $env, relogio.Date) || [];
        break;
      }

      case 'n8n-nodes-base.if': {
        const conds = node.parameters.conditions.conditions.map((c) => avaliarCondicao(c, ctx));
        const combinador = node.parameters.conditions.combinator || 'and';
        const passou = combinador === 'and' ? conds.every(Boolean) : conds.some(Boolean);
        ramo = passou ? 0 : 1;
        break;
      }

      case 'n8n-nodes-base.httpRequest': {
        const chamada = {
          no: nome,
          metodo: node.parameters.method || 'GET',
          url: resolver(node.parameters.url, ctx),
          body: node.parameters.jsonBody ? resolver(node.parameters.jsonBody, ctx) : undefined,
        };
        rastro.http.push(chamada);
        const mock = mocks[nome];
        const resposta = typeof mock === 'function' ? mock(chamada) : mock;
        saida = [{ json: resposta ?? { ok: true } }];
        break;
      }

      case '@n8n/n8n-nodes-langchain.agent': {
        const info = {
          no: nome,
          systemMessage: resolver(node.parameters.options?.systemMessage, ctx),
          prompt: resolver(node.parameters.text, ctx),
          tools: (ligacoes[nome]?.ai_tool || []).slice().sort(),
          memoria: (ligacoes[nome]?.ai_memory || [])[0] || null,
          modelo: (ligacoes[nome]?.ai_languageModel || [])[0] || null,
        };
        // o classificador devolve categoria; os agentes de atendimento, texto
        const mock = mocks[nome];
        const output = typeof mock === 'function' ? mock(info) : (mock ?? '(resposta do agente)');
        if (nome === 'Classificador de Intenção (IA)') rastro.classificador = { ...info, output };
        else rastro.agente = info;
        saida = [{ json: { ...ctx.json, output, intermediateSteps: [] } }];
        break;
      }

      default:
        throw new Error(`tipo de nó não suportado no runtime de teste: ${node.type}`);
    }

    saidas[nome] = saida;
    if (nome === 'Aplicar Guarda de Categoria') rastro.categoria = saida[0]?.json?.categoria ?? null;
    if (nome === 'Montar Preâmbulo') rastro.contexto = saida[0]?.json;

    if (!saida.length) { rastro.ignorado = true; continue; } // code node que devolve [] encerra o ramo
    for (const destino of proximos(nome, ramo)) fila.push({ nome: destino, itens: saida });
  }

  const ultimoTexto = saidas['Corrigir Formatação WhatsApp']?.[0]?.json?.output;
  rastro.respostaFinal = ultimoTexto ?? null;
  rastro.enviouTexto = rastro.http.some((h) => h.url.includes('/send-text'));
  rastro.enviouMenu = rastro.http.some((h) => h.url.includes('/send-option-list'));
  return rastro;
}

module.exports = { executarTurno, criarRelogio, resolver };
