const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../email-preview');
const outPath = path.resolve(__dirname, '../email-preview/artifact.html');

const files = {
  lembrete: fs.readFileSync(path.join(dir, 'lembrete.html'), 'utf8'),
  hoje: fs.readFileSync(path.join(dir, 'vencimento_hoje.html'), 'utf8'),
  cobranca: fs.readFileSync(path.join(dir, 'cobranca.html'), 'utf8'),
  aviso: fs.readFileSync(path.join(dir, 'aviso.html'), 'utf8'),
  renegOferta: fs.readFileSync(path.join(dir, 'renegociacao_oferta.html'), 'utf8'),
  renegLembrete: fs.readFileSync(path.join(dir, 'renegociacao_lembrete.html'), 'utf8'),
  confirmacao: fs.readFileSync(path.join(dir, 'confirmacao_matricula.html'), 'utf8'),
};

const subjects = {
  lembrete: 'IPESSP - Sua Parcela Vence em Breve',
  hoje: 'IPESSP - Vencimento da sua parcela',
  cobranca: 'IPESSP - Mensalidade em atraso — 5 dias',
  aviso: 'IPESSP - Aviso Importante: vencimento em 3 dias',
  renegOferta: 'IPESSP - Condições especiais para regularizar sua mensalidade',
  renegLembrete: 'IPESSP - Já conferiu a solução para o seu atraso?',
  confirmacao: 'Sua matrícula em Biomedicina — Acesse o link de pagamento',
};

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

const shell = `<!doctype html>
<title>Templates de e-mail — IPESSP</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  :root {
    --paper: #f4f1ef;
    --panel: #ffffff;
    --ink: #241b1a;
    --ink-dim: #6b5c59;
    --line: #e4dcd9;
    --accent: #7c2529;
    --accent-ink: #ffffff;
    --mono: 'SF Mono', 'Cascadia Code', Consolas, monospace;
    --sans: -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  :root[data-theme="dark"] {
    --paper: #161211;
    --panel: #1e1817;
    --ink: #f1e9e7;
    --ink-dim: #a89490;
    --line: #362b29;
    --accent: #e0777b;
    --accent-ink: #1a1010;
  }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      --paper: #161211;
      --panel: #1e1817;
      --ink: #f1e9e7;
      --ink-dim: #a89490;
      --line: #362b29;
      --accent: #e0777b;
      --accent-ink: #1a1010;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    background: var(--paper);
    color: var(--ink);
    font-family: var(--sans);
    min-height: 100vh;
  }
  .shell {
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 20px 48px;
  }
  header {
    margin-bottom: 22px;
  }
  header .eyebrow {
    font-family: var(--mono);
    font-size: 11px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--accent);
    margin: 0 0 6px;
  }
  header h1 {
    font-size: 22px;
    font-weight: 650;
    margin: 0 0 4px;
    text-wrap: balance;
  }
  header p {
    margin: 0;
    color: var(--ink-dim);
    font-size: 13.5px;
    max-width: 62ch;
    line-height: 1.55;
  }
  .layout {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 20px;
    align-items: start;
  }
  @media (max-width: 760px) {
    .layout { grid-template-columns: 1fr; }
  }
  nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: sticky;
    top: 20px;
  }
  @media (max-width: 760px) {
    nav { position: static; flex-direction: row; overflow-x: auto; }
  }
  .tab {
    text-align: left;
    border: 1px solid var(--line);
    background: var(--panel);
    color: var(--ink);
    border-radius: 10px;
    padding: 12px 14px;
    cursor: pointer;
    font-family: var(--sans);
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 190px;
    transition: border-color .15s ease, box-shadow .15s ease;
  }
  .tab:hover { border-color: var(--accent); }
  .tab:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .tab .stage {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-dim);
  }
  .tab .label {
    font-size: 14px;
    font-weight: 600;
  }
  .tab.active {
    border-color: var(--accent);
    box-shadow: inset 3px 0 0 var(--accent);
    background: color-mix(in srgb, var(--accent) 8%, var(--panel));
  }
  .tab.active .stage { color: var(--accent); }
  main {
    border: 1px solid var(--line);
    background: var(--panel);
    border-radius: 12px;
    overflow: hidden;
  }
  .subject-bar {
    padding: 14px 18px;
    border-bottom: 1px solid var(--line);
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 6px 10px;
  }
  .subject-bar .k {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ink-dim);
  }
  .subject-bar .v {
    font-size: 14px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .frame-wrap {
    overflow-x: auto;
    background: #e9e4e1;
  }
  :root[data-theme="dark"] .frame-wrap { background: #0f0c0b; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) .frame-wrap { background: #0f0c0b; }
  }
  iframe {
    width: 100%;
    min-width: 640px;
    height: 1400px;
    border: 0;
    display: block;
  }
  footer {
    margin-top: 16px;
    font-size: 12px;
    color: var(--ink-dim);
    line-height: 1.6;
  }
  footer code {
    font-family: var(--mono);
    background: color-mix(in srgb, var(--accent) 10%, transparent);
    padding: 1px 5px;
    border-radius: 4px;
  }
</style>

<div class="shell">
  <header>
    <p class="eyebrow">scripts/preview-email.ts &middot; dados fake</p>
    <h1>Templates do ciclo de cobrança</h1>
    <p>Renderização real dos 7 templates com os dados de teste do script. Aviso e as duas renegociações disparam depois/antes do vencimento conforme os dias configurados (ver <code>EMAIL_DIAS_AVISO</code> / <code>EMAIL_DIAS_RENEGOCIACAO_OVERLAP</code>). Cabeçalho e rodapé agora usam ícones reais (PNG hospedado) em todos os templates, inclusive na confirmação de matrícula.</p>
  </header>

  <div class="layout">
    <nav>
      <button class="tab active" data-tab="lembrete">
        <span class="stage">Antes</span>
        <span class="label">Lembrete (D-3)</span>
      </button>
      <button class="tab" data-tab="hoje">
        <span class="stage">No dia</span>
        <span class="label">Vencimento hoje</span>
      </button>
      <button class="tab" data-tab="cobranca">
        <span class="stage">Depois</span>
        <span class="label">Cobrança (5d atraso)</span>
      </button>
      <button class="tab" data-tab="aviso">
        <span class="stage">Paralelo</span>
        <span class="label">Aviso formal</span>
      </button>
      <button class="tab" data-tab="renegOferta">
        <span class="stage">Renegociação</span>
        <span class="label">Oferta detalhada</span>
      </button>
      <button class="tab" data-tab="renegLembrete">
        <span class="stage">Renegociação</span>
        <span class="label">Lembrete direto</span>
      </button>
      <button class="tab" data-tab="confirmacao">
        <span class="stage">Matrícula</span>
        <span class="label">Confirmação</span>
      </button>
    </nav>

    <main>
      <div class="subject-bar">
        <span class="k">Assunto</span>
        <span class="v" id="subject-line"></span>
      </div>
      <div class="frame-wrap">
        <iframe id="frame" title="Preview do e-mail"></iframe>
      </div>
    </main>
  </div>

  <footer>
    Dados de teste: aluno João da Silva, responsável Maria da Silva, mensalidade R$ 850,00 (Junho/2026), vencimento 15/06/2026. Logo carregada via URL externa pode não aparecer aqui por causa do bloqueio de imagens remotas do artifact.
  </footer>
</div>

<template id="tpl-lembrete">${esc(files.lembrete)}</template>
<template id="tpl-hoje">${esc(files.hoje)}</template>
<template id="tpl-cobranca">${esc(files.cobranca)}</template>
<template id="tpl-aviso">${esc(files.aviso)}</template>
<template id="tpl-renegOferta">${esc(files.renegOferta)}</template>
<template id="tpl-renegLembrete">${esc(files.renegLembrete)}</template>
<template id="tpl-confirmacao">${esc(files.confirmacao)}</template>

<script>
  const subjects = ${JSON.stringify(subjects)};
  const frame = document.getElementById('frame');
  const subjectLine = document.getElementById('subject-line');
  const tabs = document.querySelectorAll('.tab');

  function show(name) {
    const tpl = document.getElementById('tpl-' + name);
    frame.srcdoc = tpl.content.textContent;
    subjectLine.textContent = subjects[name];
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  }

  tabs.forEach(t => t.addEventListener('click', () => show(t.dataset.tab)));
  show('lembrete');
</script>
`;

fs.writeFileSync(outPath, shell, 'utf8');
console.log('wrote', outPath, shell.length, 'bytes');
