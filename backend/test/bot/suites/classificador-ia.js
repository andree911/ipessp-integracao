'use strict';
/**
 * Suíte 4 (opcional, `--ia`) — o Classificador de Intenção rodando de verdade.
 *
 * As outras suítes mockam esse nó, porque ele é o único ponto do roteamento que
 * depende de um modelo. Só que é justamente ele quem decide toda mensagem
 * ambígua -- inclusive "Não sou aluno", que foi o erro mais caro do incidente.
 * Aqui o system prompt sai do JSON do workflow, sem cópia, e vai pra API com as
 * mesmas mensagens; a resposta passa pelo nó "Interpretar Categoria IA" real.
 *
 * Exige ANTHROPIC_API_KEY. Custa alguns centavos: são respostas de uma palavra.
 */
const { suite, teste, igual, ok } = require('../assert');

const MODELO = process.env.BOT_TEST_MODELO || 'claude-sonnet-4-5';

// [categoria anterior, mensagem, categoria esperada, motivo]
const CASOS = [
  [null, 'bom dia', 'outro', ''],
  [null, 'quero saber sobre o curso de estética', 'lead_novo', ''],
  ['financeiro', '228.865.111-00', 'financeiro', 'continuação genérica reaproveita a categoria'],
  ['lead_novo', 'liste todos', 'lead_novo', 'continuação genérica reaproveita a categoria'],

  // o incidente: as duas mensagens que o classificador errou em produção
  ['secretaria', 'Não sou aluno', 'lead_novo', 'declarar não-vínculo tem que vencer a categoria anterior'],
  ['secretaria', 'Gostaria de tirar dúvidas sobre a pós graduação em farmácia estética', 'lead_novo',
    'curso por nome/nível é lead por padrão'],
  ['financeiro', 'ainda não estudo aí, queria saber os valores', 'lead_novo', ''],
  ['secretaria', 'não estou matriculado', 'lead_novo', ''],

  // o contrapeso: aluno de verdade não pode ser jogado pro comercial
  ['secretaria', 'preciso da declaração de matrícula da minha pós', 'secretaria', ''],
  ['financeiro', 'quero o boleto da mensalidade de setembro', 'financeiro', ''],
  ['secretaria', 'esqueci a senha do portal do aluno', 'ti', ''],
];

async function chamarClassificador(wf, categoriaAnterior, mensagem) {
  const node = wf.nodes.find((n) => n.name === 'Classificador de Intenção (IA)');
  const system = node.parameters.options.systemMessage;
  const texto = `Categoria da conversa até agora (pode não existir, ou não ter mais relação com a mensagem atual): ${categoriaAnterior || 'nenhuma'}\n\nMensagem atual do usuário: ${mensagem}`;

  const resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: MODELO,
      max_tokens: 20,
      system,
      messages: [{ role: 'user', content: texto }],
    }),
  });
  if (!resp.ok) throw new Error(`API respondeu ${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const dados = await resp.json();
  const bruto = (dados.content || []).map((b) => b.text || '').join('').trim();

  // passa pelo nó real de interpretação, que é quem normaliza a resposta
  const interpretar = wf.nodes.find((n) => n.name === 'Interpretar Categoria IA');
  const fn = new Function('$input', '$', '$getWorkflowStaticData', interpretar.parameters.jsCode);
  const original = { body: { phone: '5519996991300' } };
  const saida = fn(
    { first: () => ({ json: { output: bruto } }) },
    () => ({ first: () => ({ json: original }) }),
    () => ({}),
  );
  return { bruto, categoria: saida[0].json.categoria };
}

module.exports = async function classificadorIA({ wf }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('\n\x1b[33mClassificador de IA: ANTHROPIC_API_KEY não definida — suíte pulada\x1b[0m');
    return;
  }

  const resultados = [];
  for (const [anterior, msg, esperado] of CASOS) {
    try {
      resultados.push([anterior, msg, esperado, await chamarClassificador(wf, anterior, msg)]);
    } catch (e) {
      resultados.push([anterior, msg, esperado, { erro: e.message }]);
    }
  }

  suite(`Classificador de Intenção (IA) — chamada real (${MODELO})`, () => {
    for (const [anterior, msg, esperado, r] of resultados) {
      teste(`[${anterior || 'nenhuma'}] ${JSON.stringify(msg).slice(0, 66)} → ${esperado}`, () => {
        if (r.erro) return ok(false, `falhou ao chamar a API: ${r.erro}`);
        igual(r.categoria, esperado, `respondeu ${JSON.stringify(r.bruto)}`);
      });
    }
  });
};
