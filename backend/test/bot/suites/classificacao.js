'use strict';
/**
 * Suíte 2 — Classificação (uma mensagem por vez, código real do nó).
 *
 * Roda o jsCode do "Classificar por Regra" e, em seguida, "Aplicar Guarda de
 * Categoria" -- as duas checagens de professor (financeiro vs professor sem
 * tipo confirmado, professor vs financeiro) foram centralizadas só na guarda
 * de propósito, pra não repetir a mesma regra em dois nós; testar apenas
 * "Classificar por Regra" isolado não veria mais essa proteção, porque ela
 * não mora mais lá. A tabela mistura os casos que quebraram em produção com
 * as regressões que precisam continuar funcionando -- a correção do lead não
 * pode ter roubado mensagem de secretaria/financeiro/TI.
 *
 * `null` aqui não é falha: significa "sem palavra-chave clara, manda pro
 * Classificador de Intenção (IA)", que é o desenho do fluxo.
 */
const { suite, teste, igual, ok } = require('../assert');
const { criarRelogio } = require('../runtime');

/** Executa "Classificar por Regra" seguido de "Aplicar Guarda de Categoria" -- o mesmo par que roda em produção pra toda mensagem resolvida por regra. */
function classificar(wf, mensagem, { tipo = null, categoriaMenu = null } = {}) {
  const regra = wf.nodes.find((n) => n.name === 'Classificar por Regra');
  const guarda = wf.nodes.find((n) => n.name === 'Aplicar Guarda de Categoria');
  const cpfInfo = tipo ? { tipo } : null;
  const item = { categoria: categoriaMenu, cpfInfo, body: { phone: '5519996991300' } };
  const relogio = criarRelogio();
  const staticData = {};
  const $getWorkflowStaticData = () => staticData;
  const $ = () => ({ first: () => ({ json: { body: { text: { message: mensagem } } } }) });

  const fnRegra = new Function('$input', '$', '$getWorkflowStaticData', 'Date', regra.parameters.jsCode);
  const saidaRegra = fnRegra({ first: () => ({ json: item }) }, $, $getWorkflowStaticData, relogio.Date)[0].json;

  const fnGuarda = new Function('$input', '$getWorkflowStaticData', 'Date', guarda.parameters.jsCode);
  const saidaGuarda = fnGuarda({ first: () => ({ json: saidaRegra }) }, $getWorkflowStaticData, relogio.Date)[0].json;

  return saidaGuarda.categoria;
}

// [mensagem, tipo no cache de CPF, categoria vinda do menu, esperado, motivo]
const CASOS = [
  // --- o incidente ---------------------------------------------------------
  ['Não sou aluno', null, null, 'lead_novo', 'a frase que foi tratada como continuação genérica e prendeu o lead na Secretaria'],
  ['nao sou aluno', null, 'secretaria', 'lead_novo', 'declarar não-vínculo tem que sobrepor até a categoria vinda do menu'],
  ['Gostaria de tirar dúvidas sobre a pós graduação em farmácia estética', null, null, 'lead_novo', 'curso por nome/nível não batia em regra nenhuma'],
  ['Outro assunto', null, null, null, 'continuação genérica: quem decide é o classificador de IA'],
  ['É texto mesmo', null, null, null, 'réplica sem assunto: idem'],

  // --- variações de "não sou aluno" ----------------------------------------
  ['ainda não sou aluno', null, null, 'lead_novo', ''],
  ['ainda não estudo aí', null, null, 'lead_novo', ''],
  ['não estou matriculado ainda', null, null, 'lead_novo', ''],
  ['não tenho matrícula', null, null, 'lead_novo', ''],
  ['quero ser aluno de vocês', null, null, 'lead_novo', ''],
  ['pretendo me matricular ano que vem', null, null, 'lead_novo', ''],

  // --- curso citado por nome/nível -----------------------------------------
  ['quais são os cursos', null, null, 'lead_novo', ''],
  ['vocês têm curso de enfermagem?', null, null, 'lead_novo', ''],
  ['quero fazer o MBA', null, null, 'lead_novo', ''],
  ['queria saber sobre a graduação de fisioterapia', null, null, 'lead_novo', ''],
  ['tem curso de estética?', null, null, 'lead_novo', ''],
  ['me fala sobre o curso livre de libras', null, null, 'lead_novo', ''],
  ['queria saber dos cursos de novo', null, null, 'lead_novo', '"saber dos" também conta, não só "saber sobre"'],
  ['queria saber mais sobre a pós', null, null, 'lead_novo', ''],

  // --- ambiguidade: aluno conhecido perguntando da própria pós -------------
  ['Gostaria de tirar dúvidas sobre a pós graduação em farmácia estética', 'aluno', null, null,
    'aluno identificado no cache: o classificador de IA desempata pelo histórico, não força lead'],
  ['dúvidas sobre a minha graduação', 'aluno', null, null, ''],

  // --- regressões: a correção do lead não pode roubar as outras categorias --
  ['preciso de uma declaração de matrícula', 'aluno', null, 'secretaria', ''],
  ['declaração de matrícula da minha pós-graduação', null, null, 'secretaria',
    'a regra de secretaria roda antes do teste de curso'],
  ['quero meu histórico escolar', 'aluno', null, 'secretaria', ''],
  ['qual o prazo para trancamento', 'aluno', null, 'secretaria', ''],
  ['meu boleto venceu', 'aluno', null, 'financeiro', ''],
  ['quero pagar a mensalidade por pix', 'aluno', null, 'financeiro', ''],
  ['esqueci minha senha do portal', 'aluno', null, 'ti', ''],
  ['não consigo entrar no sistema', 'aluno', null, 'ti', ''],
  ['tem algum aviso novo?', 'aluno', null, 'avisos', ''],
  ['quando é o próximo feriado no calendário', 'aluno', null, 'calendario', ''],

  // --- guards --------------------------------------------------------------
  ['minhas turmas', 'professor', null, 'professor', ''],
  ['minhas turmas', 'aluno', null, null, 'só é professor se o cache confirmar o tipo'],
  ['minhas turmas', null, null, null, 'telefone desconhecido não vira professor'],
  ['meu boleto venceu', 'professor', null, null, 'professor não cai no financeiro'],

  // --- ruído ---------------------------------------------------------------
  ['bom dia', null, null, null, ''],
  ['obrigado!', null, null, null, ''],
  ['', null, null, null, 'mensagem vazia não pode explodir'],
];

module.exports = function classificacao({ wf }) {
  suite('Classificação — mensagem isolada (nó "Classificar por Regra")', () => {
    for (const [msg, tipo, menu, esperado, motivo] of CASOS) {
      const rotulo = [
        JSON.stringify(msg).slice(0, 62),
        tipo ? `cpf=${tipo}` : null,
        menu ? `menu=${menu}` : null,
        '→', esperado ?? 'classificador de IA',
      ].filter(Boolean).join(' ');
      teste(motivo ? `${rotulo}   (${motivo})` : rotulo, () => {
        igual(classificar(wf, msg, { tipo, categoriaMenu: menu }), esperado, 'categoria errada');
      });
    }

    teste('o menu manda direto pra categoria certa, sem passar por regra', () => {
      const node = wf.nodes.find((n) => n.name === 'Mapear Seleção do Menu');
      const fn = new Function('$input', node.parameters.jsCode);
      const mapa = {
        financeiro: 'financeiro', secretaria: 'secretaria', ti: 'ti',
        avisos: 'avisos', calendario: 'calendario', matricula: 'lead_novo',
      };
      for (const [id, esperado] of Object.entries(mapa)) {
        const payload = { body: { phone: '55', listResponseMessage: { selectedRowId: id, title: id } } };
        const saida = fn({ first: () => ({ json: payload }) });
        igual(saida[0].json.categoria, esperado, `opção "${id}" do menu`);
      }
    });

    teste('os contextos do menu proíbem segunda saudação e lista que parece botão', () => {
      const node = wf.nodes.find((n) => n.name === 'Mapear Seleção do Menu');
      const fn = new Function('$input', node.parameters.jsCode);
      for (const id of ['financeiro', 'secretaria', 'ti']) {
        const payload = { body: { phone: '55', listResponseMessage: { selectedRowId: id, title: id } } };
        const msg = fn({ first: () => ({ json: payload }) })[0].json.body.text.message;
        ok(/já cumprimentou/i.test(msg), `contexto de "${id}" não avisa que o menu já cumprimentou`);
      }
      const sec = fn({ first: () => ({ json: { body: { phone: '55', listResponseMessage: { selectedRowId: 'secretaria' } } } }) });
      ok(/sem montar lista de opções/i.test(sec[0].json.body.text.message),
        'o contexto da Secretaria não proíbe a lista que o usuário leu como botão');
    });
  });
};
