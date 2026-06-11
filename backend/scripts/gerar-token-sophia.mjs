/**
 * Gera o token de autenticação da API SophiA e atualiza o .env automaticamente.
 *
 * Uso:
 *   node scripts/gerar-token-sophia.mjs
 *
 * O script vai perguntar o usuário e senha no terminal.
 */

import { createInterface } from 'readline';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

// ─── Lê variáveis do .env sem depender de lib externa ───────────────────────
function readEnv(filePath) {
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const vars = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

function updateEnv(filePath, key, value) {
  let content = readFileSync(filePath, 'utf8');
  const regex = new RegExp(`^(${key}=).*$`, 'm');
  if (regex.test(content)) {
    content = content.replace(regex, `$1${value}`);
  } else {
    content += `\n${key}=${value}`;
  }
  writeFileSync(filePath, content);
}

// ─── Pergunta no terminal ────────────────────────────────────────────────────
function perguntar(rl, pergunta, ocultar = false) {
  return new Promise((resolve) => {
    if (ocultar) {
      process.stdout.write(pergunta);
      process.stdin.setRawMode(true);
      let resposta = '';
      process.stdin.resume();
      process.stdin.setEncoding('utf8');
      process.stdin.on('data', function handler(char) {
        if (char === '\r' || char === '\n') {
          process.stdin.setRawMode(false);
          process.stdin.removeListener('data', handler);
          process.stdout.write('\n');
          resolve(resposta);
        } else if (char === '') {
          process.exit();
        } else if (char === '') {
          if (resposta.length > 0) {
            resposta = resposta.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          resposta += char;
          process.stdout.write('*');
        }
      });
    } else {
      rl.question(pergunta, resolve);
    }
  });
}

// ─── Main ────────────────────────────────────────────────────────────────────
const env = readEnv(envPath);
const baseUrl = env['SOPHIA_BASE_URL'];
const tenant = env['SOPHIA_TENANT'];

if (!baseUrl) {
  console.error('❌  SOPHIA_BASE_URL não está definida no .env');
  process.exit(1);
}

const authUrl = tenant
  ? `${baseUrl}/${tenant}/api/v1/Autenticacao`
  : `${baseUrl}/api/v1/Autenticacao`;

console.log('\n========================================');
console.log('  Gerador de Token — SophiA API');
console.log('========================================');
console.log(`URL de autenticação: ${authUrl}\n`);

const rl = createInterface({ input: process.stdin, output: process.stdout });

const usuario = await perguntar(rl, 'Usuário: ');
const senha = await perguntar(rl, 'Senha:   ', true);
rl.close();

console.log('\nAutenticando...');

try {
  const response = await fetch(authUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha }),
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(`\n❌  Erro ${response.status}: ${text}`);
    process.exit(1);
  }

  // O SophiA retorna o token como string (com ou sem aspas)
  const token = text.replace(/^"|"$/g, '').trim();

  if (!token || token.length < 10) {
    console.error('\n❌  Resposta inesperada:', text);
    process.exit(1);
  }

  updateEnv(envPath, 'SOPHIA_TOKEN', token);

  console.log('\n✅  Token gerado e salvo no .env com sucesso!');
  console.log(`    Token: ${token.substring(0, 20)}... (${token.length} caracteres)`);
  console.log('\n    Próximo passo: preencher as credenciais da Receiv no .env\n');
} catch (err) {
  console.error('\n❌  Falha na requisição:', err.message);
  process.exit(1);
}
