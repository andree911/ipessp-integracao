/**
 * Diagnóstico da API SophiA — conta alunos com diferentes filtros
 *
 * Uso:
 *   node scripts/diagnostico-sophia.mjs
 */

import { createInterface } from 'readline';

const rl = createInterface({ input: process.stdin, output: process.stdout });
const perguntar = (q) => new Promise(r => rl.question(q, r));

const baseUrl = (await perguntar('SOPHIA_BASE_URL (ex: https://portal.sophia.com.br/SophiAWebAPI): ')).trim();
const tenant  = (await perguntar('SOPHIA_TENANT (deixe vazio se não usar): ')).trim();
const usuario = (await perguntar('SOPHIA_USUARIO: ')).trim();
const senha   = (await perguntar('SOPHIA_SENHA: ')).trim();
rl.close();

const API = tenant ? `${baseUrl}/${tenant}/api/v1` : `${baseUrl}/api/v1`;

async function autenticar() {
  const res = await fetch(`${API}/Autenticacao`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha }),
  });
  const text = await res.text();
  return text.replace(/^"|"$/g, '').trim();
}

async function contarAlunos(token, params = {}) {
  const qs = new URLSearchParams({ Pagina: 1, TamanhoPagina: 500, ...params });
  let total = 0;
  let pagina = 1;
  while (true) {
    qs.set('Pagina', pagina);
    const res = await fetch(`${API}/Alunos?${qs}`, { headers: { token } });
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    total += data.length;
    if (data.length < 500) break;
    pagina++;
  }
  return total;
}

async function main() {
  console.log(`\nAPI: ${API}\n`);
  console.log('Autenticando...');
  const token = await autenticar();
  console.log('Token OK\n');

  console.log('Contando alunos com diferentes filtros:\n');

  const cenarios = [
    { label: 'Padrão (ativos, turma ativa)',            params: {} },
    { label: 'Incluindo inativos',                       params: { Inativos: true } },
    { label: 'Incluindo turmas finalizadas',             params: { ConsiderarTurmaFinalizada: true } },
    { label: 'Inativos + turmas finalizadas',            params: { Inativos: true, ConsiderarTurmaFinalizada: true } },
  ];

  for (const { label, params } of cenarios) {
    const total = await contarAlunos(token, params);
    console.log(`  ${label.padEnd(45)} → ${total} alunos`);
  }

  console.log('\nDiagnóstico concluído.\n');
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
