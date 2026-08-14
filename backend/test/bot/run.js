#!/usr/bin/env node
'use strict';
/**
 * Runner da suíte do chatbot.
 *
 *   node test/bot/run.js                      # workflow da integração
 *   node test/bot/run.js --workflow <arquivo> # outra cópia (ex.: a do core)
 *   node test/bot/run.js --ia                 # roda o classificador de IA de verdade
 *
 * Sem rede e sem dependências por padrão: o fluxo roda num mini-runtime do n8n
 * (test/bot/runtime.js) e os backends são mockados. `--ia` é o único modo que
 * sai pra internet, e exige ANTHROPIC_API_KEY.
 */
const fs = require('fs');
const path = require('path');

const { relatorio } = require('./assert');
const contratos = require('./suites/contratos');
const classificacao = require('./suites/classificacao');
const conversas = require('./suites/conversas');
const classificadorIA = require('./suites/classificador-ia');

const args = process.argv.slice(2);
const opcao = (nome) => {
  const i = args.indexOf(`--${nome}`);
  return i === -1 ? null : (args[i + 1] || true);
};

const RAIZ = path.resolve(__dirname, '../..');
const WORKFLOW = path.resolve(opcao('workflow') || path.join(RAIZ, 'docs/Bot-IPESSP-WhatsApp.roteado.json'));

// A cópia do core mora em outro repositório; se estiver ao lado, a suíte também
// checa se as duas continuam em sincronia (já saíram, e ninguém percebeu).
const CORE_WORKFLOW = process.env.CORE_WORKFLOW
  || path.resolve(RAIZ, '../../ipessp-sistema/core/n8n/Bot-IPESSP-WhatsApp.json');
const CORE_SRC = process.env.CORE_SRC || path.resolve(RAIZ, '../../ipessp-sistema/core/src');

function carregar(p) {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

const wf = carregar(WORKFLOW);
if (!wf) {
  console.error(`workflow não encontrado: ${WORKFLOW}`);
  process.exit(2);
}
const wfCore = WORKFLOW === path.resolve(CORE_WORKFLOW) ? null : carregar(CORE_WORKFLOW);

console.log(`workflow: ${path.relative(RAIZ, WORKFLOW)} (${wf.nodes.length} nós)`);
console.log(wfCore ? `cópia do core: ${CORE_WORKFLOW}` : 'cópia do core: indisponível — checagem de sincronia pulada');

const { coletarRotas } = require('./rotas');
const rotasIntegracao = coletarRotas(path.join(RAIZ, 'src'));
const rotasCore = coletarRotas(CORE_SRC);
console.log(rotasCore ? `controllers do core: ${CORE_SRC}` : 'controllers do core: indisponíveis — rotas do core não checadas');

const ctx = { wf, wfCore, rotasIntegracao, rotasCore, RAIZ };

contratos(ctx);
classificacao(ctx);
conversas(ctx);

const rodarIA = async () => {
  if (!opcao('ia')) {
    console.log('\n\x1b[90mClassificador de IA: pulado (use --ia com ANTHROPIC_API_KEY pra rodar de verdade)\x1b[0m');
    return;
  }
  await classificadorIA(ctx);
};

rodarIA().then(() => process.exit(relatorio()));
