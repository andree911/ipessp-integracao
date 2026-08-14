'use strict';
/**
 * Suíte 1 — Contratos e estrutura (estática, sem executar o fluxo).
 *
 * Pega a classe de erro que só aparece em produção: tool apontando pra rota que
 * não existe mais no backend, nó órfão depois de uma edição no editor do n8n,
 * agente sem memória/modelo, e as duas cópias do workflow saindo de sincronia
 * (que já aconteceu -- a cópia do core ficou quatro correções atrás).
 */
const { rotaExiste } = require('../rotas');
const { suite, teste, ok, igual, falhar } = require('../assert');

/** URL da tool -> qual backend e qual caminho. */
function analisarUrl(url) {
  const m = String(url).match(/\$env\.(INTEGRACAO_API_URL|IPESSP_CORE_URL)\s*\}\}(\/[^'"`\s]*)/);
  if (!m) return null;
  return { backend: m[1], caminho: m[2].replace(/\{\{[^}]*\}\}/g, '').replace(/\?.*$/, '').replace(/\/$/, '') };
}

module.exports = function contratos({ wf, wfCore, rotasIntegracao, rotasCore }) {
  suite('Contratos — tools x rotas reais dos backends', () => {
    const nos = wf.nodes.filter((n) => n.type.includes('httpRequest'));

    teste('toda tool/HTTP aponta pra uma rota que existe no backend', () => {
      let checadas = 0;
      for (const n of nos) {
        const alvo = analisarUrl(n.parameters.url);
        if (!alvo) continue; // Z-API e afins: fora do escopo
        const rotas = alvo.backend === 'INTEGRACAO_API_URL' ? rotasIntegracao : rotasCore;
        if (!rotas) continue; // repositório do core não disponível nesta execução
        checadas++;
        const metodo = n.parameters.method || 'GET';
        if (!rotaExiste(rotas, metodo, alvo.caminho)) {
          falhar(`"${n.name}" chama ${metodo} ${alvo.caminho} (${alvo.backend}), que não existe no controller`);
        }
      }
      ok(checadas > 0, 'nenhuma rota foi checada — o parser de controllers quebrou?');
    });

    teste('toda tool manda o header de autenticação do backend certo', () => {
      for (const n of nos) {
        const alvo = analisarUrl(n.parameters.url);
        if (!alvo) continue;
        const headers = (n.parameters.headerParameters?.parameters || []).map((h) => h.name);
        const esperado = alvo.backend === 'INTEGRACAO_API_URL' ? 'Authorization' : 'x-admin-key';
        if (!headers.includes(esperado)) {
          falhar(`"${n.name}" fala com ${alvo.backend} mas não manda ${esperado} (manda: ${headers.join(', ') || 'nada'})`);
        }
      }
    });

    teste('o encaminhamento de novos alunos usa o setor comercial', () => {
      const tool = wf.nodes.find((n) => n.name === 'Encaminhar para Novos Alunos');
      ok(tool, 'tool "Encaminhar para Novos Alunos" não existe no workflow');
      if (!tool) return;
      ok(/"setor":\s*"comercial"/.test(tool.parameters.jsonBody), 'a tool não manda setor=comercial');
      ok(/\$fromAI\('resumo'/.test(tool.parameters.jsonBody), 'a tool não coleta um resumo pro humano');
    });
  });

  suite('Estrutura — grafo do workflow', () => {
    const nomes = new Set(wf.nodes.map((n) => n.name));

    teste('nenhuma conexão aponta pra nó inexistente', () => {
      for (const [origem, conns] of Object.entries(wf.connections)) {
        if (!nomes.has(origem)) falhar(`conexão saindo de nó inexistente: "${origem}"`);
        for (const ramos of Object.values(conns)) {
          for (const ramo of ramos || []) {
            for (const c of ramo || []) {
              if (!nomes.has(c.node)) falhar(`"${origem}" aponta pro nó inexistente "${c.node}"`);
            }
          }
        }
      }
    });

    teste('todo nó é alcançável (nenhum órfão depois das edições)', () => {
      const alcancados = new Set(['Webhook']);
      const fila = ['Webhook'];
      while (fila.length) {
        const atual = fila.shift();
        for (const ramos of Object.values(wf.connections[atual]?.main || {})) {
          for (const c of ramos || []) {
            if (!alcancados.has(c.node)) { alcancados.add(c.node); fila.push(c.node); }
          }
        }
      }
      // tools/memória/modelo entram nos agentes por conexão própria, não por main
      for (const [origem, conns] of Object.entries(wf.connections)) {
        if (Object.keys(conns).some((t) => t !== 'main')) alcancados.add(origem);
      }
      for (const n of wf.nodes) {
        if (!alcancados.has(n.name)) falhar(`nó órfão, nunca executa: "${n.name}"`);
      }
    });

    teste('todo agente tem modelo e memória ligados', () => {
      const ligados = {};
      for (const [origem, conns] of Object.entries(wf.connections)) {
        for (const [tipo, ramos] of Object.entries(conns)) {
          if (tipo === 'main') continue;
          for (const ramo of ramos || []) for (const c of ramo || []) ((ligados[c.node] ||= {})[tipo] ||= []).push(origem);
        }
      }
      for (const n of wf.nodes.filter((x) => x.type.endsWith('langchain.agent'))) {
        ok(ligados[n.name]?.ai_languageModel?.length, `"${n.name}" está sem modelo`);
        if (n.name !== 'Classificador de Intenção (IA)') {
          ok(ligados[n.name]?.ai_memory?.length, `"${n.name}" está sem memória`);
          ok(ligados[n.name]?.ai_tool?.length, `"${n.name}" está sem nenhuma tool`);
        }
      }
    });

    teste('toda tool está ligada a algum agente', () => {
      const usadas = new Set();
      for (const conns of Object.values(wf.connections)) {
        for (const [tipo, ramos] of Object.entries(conns)) {
          if (tipo !== 'ai_tool') continue;
          for (const ramo of ramos || []) for (const c of ramo || []) usadas.add(c.node);
        }
      }
      for (const n of wf.nodes.filter((x) => x.type === 'n8n-nodes-base.httpRequestTool')) {
        const ligada = Object.entries(wf.connections).some(([origem, c]) => origem === n.name && c.ai_tool);
        ok(ligada, `tool "${n.name}" não está ligada a agente nenhum`);
      }
      ok(usadas.size >= 5, 'quase nenhum agente recebeu tools — grafo suspeito');
    });

    teste('toda tool declara uma descrição pro modelo saber quando usar', () => {
      for (const n of wf.nodes.filter((x) => x.type === 'n8n-nodes-base.httpRequestTool')) {
        const d = n.parameters.toolDescription || '';
        ok(d.length > 40, `tool "${n.name}" está sem descrição (ou com uma curta demais)`);
      }
    });
  });

  suite('Memória — configuração compartilhada', () => {
    const memorias = wf.nodes.filter((n) => n.type.endsWith('memoryBufferWindow'));

    teste('os 5 agentes compartilham a MESMA chave de sessão', () => {
      igual(memorias.length, 5, 'esperava 5 nós de memória');
      const chaves = new Set(memorias.map((m) => m.parameters.sessionKey));
      igual(chaves.size, 1, `memórias com chaves diferentes: ${[...chaves].join(' | ')}`);
      const chave = [...chaves][0] || '';
      ok(/body\.phone/.test(chave), 'a chave de sessão não é o telefone');
      ok(!/:(secretaria|financeiro|lead_novo|ti|professor)/.test(chave),
        'a chave ainda tem sufixo de categoria — troca de assunto vai perder o histórico de novo');
    });

    teste('a janela de contexto comporta uma conversa que troca de setor', () => {
      for (const m of memorias) {
        ok((m.parameters.contextWindowLength ?? 0) >= 20,
          `"${m.name}" com janela de ${m.parameters.contextWindowLength} — curta demais pra memória compartilhada`);
      }
    });
  });

  if (wfCore) {
    suite('Sincronia — cópia do core x cópia da integração', () => {
      const A = Object.fromEntries(wfCore.nodes.map((n) => [n.name, n]));
      const B = Object.fromEntries(wf.nodes.map((n) => [n.name, n]));
      const compartilhados = Object.keys(A).filter((n) => n in B);

      teste('nós compartilhados têm parâmetros idênticos (só o webhook difere)', () => {
        for (const nome of compartilhados) {
          if (nome === 'Webhook') continue; // path é por instância
          const a = JSON.stringify(A[nome].parameters, Object.keys(A[nome].parameters).sort());
          const b = JSON.stringify(B[nome].parameters, Object.keys(B[nome].parameters).sort());
          if (a !== b) falhar(`"${nome}" está diferente entre as duas cópias do workflow`);
        }
      });

      teste('a cópia do core mantém os nós exclusivos dela', () => {
        for (const nome of ['Cadastrar Aluno', 'Realizar Matrícula', 'Verificar Lead CRM', 'Gerar Boleto']) {
          ok(nome in A, `a cópia do core perdeu o nó exclusivo "${nome}"`);
        }
      });
    });
  }
};
