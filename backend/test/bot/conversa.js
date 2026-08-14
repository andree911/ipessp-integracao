'use strict';
/**
 * Camada de conversa: um telefone, vários turnos, o mesmo `staticData` e o mesmo
 * relógio entre eles -- que é o que torna possível testar CONTEXTO e TROCA DE
 * CONTEXTO, e não só uma mensagem isolada.
 */
const { executarTurno, criarRelogio } = require('./runtime');

const TELEFONE = '5519996991300';

/** Payloads da Z-API, do jeito que chegam no webhook. */
const texto = (message, phone = TELEFONE) => ({
  body: { phone, fromMe: false, text: { message } },
});
const opcaoDoMenu = (selectedRowId, title, phone = TELEFONE) => ({
  body: { phone, fromMe: false, listResponseMessage: { selectedRowId, title } },
});
const midia = (tipo, phone = TELEFONE) => ({
  body: { phone, fromMe: false, [tipo]: { url: 'https://exemplo/arquivo' } },
});
const doBot = (message, phone = TELEFONE) => ({
  body: { phone, fromMe: true, text: { message } },
});

/**
 * Stub padrão do Classificador de Intenção (IA), usado nas mensagens que não
 * batem em regra nenhuma. Imita a instrução que está no systemMessage real:
 * continuação genérica reaproveita a categoria da conversa até agora, que o
 * próprio nó recebe no prompt. Um stub que devolvesse sempre "outro" jogaria a
 * conversa no menu e mascararia justamente os testes de contexto.
 *
 * Se o modelo de verdade segue essa regra é o que a suíte `--ia` verifica.
 */
function classificadorPadrao(info) {
  const anterior = (String(info.prompt).match(/Categoria da conversa até agora[^:]*:\s*(\w+)/) || [])[1];
  return anterior && anterior !== 'nenhuma' ? anterior : 'outro';
}

/**
 * Cria uma conversa. `cpf` define o que o endpoint de cpf-por-telefone devolve
 * (null = telefone desconhecido, o caso de um lead), e `classificarIA` faz o
 * papel do Classificador de Intenção (IA) nas mensagens ambíguas.
 */
function criarConversa(wf, { cpf = null, classificarIA = classificadorPadrao, relogio = criarRelogio() } = {}) {
  const staticData = {};
  const turnos = [];

  const respostaCpf = cpf
    ? { telefone: TELEFONE, cpf: cpf.cpf, nomeResponsavel: cpf.nome ?? null, tipo: cpf.tipo ?? null, email: cpf.email ?? null }
    : { error: true, message: 'Nenhum CPF associado a este número de telefone' };

  function enviar(payload, opcoes = {}) {
    const mocks = {
      'Buscar CPF por Telefone': respostaCpf,
      'Buscar CPF por Telefone (Menu)': respostaCpf,
      'Buscar Avisos': [{ id: 1, titulo: 'Aviso de teste', mensagem: 'corpo', criado_em: '2026-08-01' }],
      'Buscar Calendário': [{ id: 1, titulo: 'Evento de teste', data_evento: '2026-08-20', tipo: 'prova' }],
      'Classificador de Intenção (IA)': (info) => classificarIA(info, payload),
      ...(opcoes.mocks || {}),
    };
    const rastro = executarTurno(wf, payload, { staticData, relogio, mocks });
    turnos.push(rastro);
    return rastro;
  }

  return {
    enviar,
    texto: (m, o) => enviar(texto(m), o),
    menu: (id, titulo, o) => enviar(opcaoDoMenu(id, titulo), o),
    midia: (t, o) => enviar(midia(t), o),
    esperar: (ms) => relogio.avancar(ms),
    get turnos() { return turnos; },
    get ultimo() { return turnos[turnos.length - 1]; },
    staticData,
    relogio,
  };
}

module.exports = { criarConversa, classificadorPadrao, texto, opcaoDoMenu, midia, doBot, TELEFONE };
