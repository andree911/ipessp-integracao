#!/usr/bin/env node
'use strict';
/**
 * Teste da suíte de testes: desfaz uma correção por vez, numa cópia temporária
 * do workflow, e confere que `npm run test:bot` fica vermelho.
 *
 * Existe porque suíte que não sabe falhar não vale nada -- e é fácil escrever,
 * sem perceber, uma asserção que passa em qualquer cenário. Ao mexer no fluxo,
 * se uma mutação daqui virar "PASSOU", ou a correção sumiu ou o teste que a
 * cobria virou decorativo.
 *
 *   npm run test:bot:mutacao
 */
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '../..');
const ORIG = path.join(RAIZ, 'docs/Bot-IPESSP-WhatsApp.roteado.json');
const TMP = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bot-mut-')), 'mutante.json');

const no = (wf, nome) => wf.nodes.find((n) => n.name === nome);

const MUTACOES = {
  'memória volta a ser por categoria': (wf) => {
    for (const m of wf.nodes.filter((n) => n.type.endsWith('memoryBufferWindow'))) {
      m.parameters.sessionKey = "={{ $('Webhook').first().json.body.phone }}:" + m.name.split(' ')[1].toLowerCase();
    }
  },
  'remove a regra de "não sou aluno"': (wf) => {
    const n = no(wf, 'Classificar por Regra');
    n.parameters.jsCode = n.parameters.jsCode.replace('if (NAO_ALUNO_RE.test(msg)) categoria = \'lead_novo\';', '');
  },
  'remove o teste de curso por nome/nível': (wf) => {
    const n = no(wf, 'Classificar por Regra');
    n.parameters.jsCode = n.parameters.jsCode.replace(/if \(!categoria && tipo !== 'aluno' && CURSO_RE\.test\(msg\)\).*/, '');
  },
  'aviso de mídia deixa de ser registrado': (wf) => {
    delete wf.connections['Responder Mídia Não Suportada'];
  },
  'menu deixa de ser registrado': (wf) => {
    delete wf.connections['Enviar Menu Inicial'];
  },
  'volta o telefone do Financeiro no aviso de mídia': (wf) => {
    const n = no(wf, 'Avaliar Mídia Recebida');
    n.parameters.jsCode = n.parameters.jsCode.replace(
      /const mensagens = \[[\s\S]*?\];/,
      "const mensagens = ['Olá! No momento só consigo responder mensagens de texto. Ligue para (11) 99839-3640 ou matricula.financeiro@ipessp.edu.br.'];");
  },
  'figurinha volta a ser respondida': (wf) => {
    const n = no(wf, 'Avaliar Mídia Recebida');
    n.parameters.jsCode = n.parameters.jsCode.replace('if (ehCortesia) return [];', '');
  },
  'Secretaria perde a tool de novos alunos': (wf) => {
    delete wf.connections['Encaminhar para Novos Alunos'];
  },
  'volta o beco sem saída no prompt da Secretaria': (wf) => {
    const n = no(wf, 'Agent Secretaria');
    n.parameters.options.systemMessage = n.parameters.options.systemMessage.replace(
      /Se durante a conversa ficar claro[^]*?duração de curso\./,
      'Se durante a conversa ficar claro que a pessoa NÃO é aluna, explique que vai direcionar para o atendimento de novos alunos e encerre essa resposta.');
  },
  'guarda de professor volta a ser só metade': (wf) => {
    const n = no(wf, 'Aplicar Guarda de Categoria');
    n.parameters.jsCode = n.parameters.jsCode.replace(/if \(categoria === 'financeiro' && tipo === 'professor'\) \{[\s\S]*?\}/, '');
  },
  'preâmbulo para de injetar os envios automáticos': (wf) => {
    const n = no(wf, 'Preparar Preâmbulo Compartilhado');
    n.parameters.jsCode = n.parameters.jsCode.replace('${blocoEnvios}', '');
  },
  'preâmbulo para de avisar transferência de setor': (wf) => {
    const n = no(wf, 'Preparar Preâmbulo Compartilhado');
    n.parameters.jsCode = n.parameters.jsCode.replace('${blocoTransferencia}', '');
  },
  'tool aponta pra rota que não existe': (wf) => {
    no(wf, 'Consultar Secretaria').parameters.url = '={{ $env.INTEGRACAO_API_URL }}/ia/secretaria-antiga';
  },
  'nó vira órfão': (wf) => {
    delete wf.connections['Avaliar Mídia Recebida'];
  },
};

let pegou = 0;
for (const [nome, mutar] of Object.entries(MUTACOES)) {
  const wf = JSON.parse(fs.readFileSync(ORIG, 'utf8'));
  mutar(wf);
  fs.writeFileSync(TMP, JSON.stringify(wf, null, 2));
  let saida;
  try {
    saida = execFileSync('node', [path.join(__dirname, 'run.js'), '--workflow', TMP], { encoding: 'utf8', cwd: RAIZ });
    console.log(`  \x1b[31mPASSOU\x1b[0m  ${nome}  ← a suíte não pegou!`);
  } catch (e) {
    saida = e.stdout || '';
    const linha = (saida.match(/^\d+ de \d+ testes falharam.*$/m) || ['falhou'])[0];
    console.log(`  \x1b[32mpegou\x1b[0m   ${nome}  (${linha})`);
    pegou++;
  }
}
console.log(`\n${pegou}/${Object.keys(MUTACOES).length} mutações detectadas`);
process.exit(pegou === Object.keys(MUTACOES).length ? 0 : 1);
