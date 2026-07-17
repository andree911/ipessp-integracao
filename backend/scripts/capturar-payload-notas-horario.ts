/**
 * Chama direto na Sophia os endpoints de Notas e Horário (os únicos dois
 * campos que a própria documentação Swagger da Sophia não especifica —
 * ver documentacao/swagger.json) pra capturar o payload real que volta,
 * e salva num arquivo pra parar de renderizar tudo de forma genérica em
 * app/portal-do-aluno/(protegido)/notas/page.tsx e horario/page.tsx.
 *
 * Uso:
 *   npx ts-node scripts/capturar-payload-notas-horario.ts <codigo_aluno> [codigo_matricula]
 *
 * Se `codigo_matricula` não for informado, usa a primeira matrícula
 * encontrada pro aluno. Precisa de um .env real com SOPHIA_BASE_URL,
 * SOPHIA_TENANT, SOPHIA_USUARIO, SOPHIA_SENHA — não roda sem isso.
 */

import axios from 'axios';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE   = process.env.SOPHIA_BASE_URL!;
const TENANT = process.env.SOPHIA_TENANT ?? '';
const API    = TENANT ? `${BASE}/${TENANT}/api/v1` : `${BASE}/api/v1`;

async function autenticar(): Promise<string> {
  const { data } = await axios.post<string>(
    `${API}/Autenticacao`,
    { usuario: process.env.SOPHIA_USUARIO, senha: process.env.SOPHIA_SENHA },
    { headers: { 'Content-Type': 'application/json', accept: 'text/plain' } },
  );
  return String(data).replace(/"/g, '').trim();
}

async function main() {
  const [codigoAlunoArg, codigoMatriculaArg] = process.argv.slice(2);
  const codigoAluno = parseInt(codigoAlunoArg, 10);

  if (!codigoAluno || isNaN(codigoAluno)) {
    console.error('Uso: npx ts-node scripts/capturar-payload-notas-horario.ts <codigo_aluno> [codigo_matricula]');
    process.exit(1);
  }

  console.log('Autenticando no Sophia...');
  const token = await autenticar();
  const headers = { token };

  let codigoMatricula = codigoMatriculaArg ? parseInt(codigoMatriculaArg, 10) : undefined;

  if (!codigoMatricula) {
    console.log(`Buscando matrículas do aluno ${codigoAluno}...`);
    const { data: wrappers } = await axios.get(`${API}/alunos/${codigoAluno}/Matriculas`, { headers });
    const matriculas = (wrappers as any[]).flatMap((w) => w.matriculas ?? []);
    if (matriculas.length === 0) {
      console.error(`Aluno ${codigoAluno} não tem matrícula nenhuma.`);
      process.exit(1);
    }
    codigoMatricula = matriculas[0].codigoMatricula;
    console.log(`Usando a primeira matrícula encontrada: ${codigoMatricula} (${matriculas[0].nomeSerie ?? '-'} — ${matriculas[0].situacao ?? '-'})`);
    if (matriculas.length > 1) {
      console.log(`(aluno tem ${matriculas.length} matrículas — passe o código como 2º argumento pra escolher outra: ${matriculas.map((m) => m.codigoMatricula).join(', ')})`);
    }
  }

  console.log(`Chamando NotasAvaliacoesCompleto e QuadrosHorarios/Detalhados pra matrícula ${codigoMatricula}...`);

  const [notas, horario] = await Promise.all([
    axios.get(`${API}/alunos/Matriculas/${codigoMatricula}/NotasAvaliacoesCompleto`, { headers })
      .then((r) => ({ status: r.status, data: r.data }))
      .catch((err) => ({ status: err.response?.status ?? 'erro', data: err.response?.data ?? String(err.message) })),
    axios.get(`${API}/alunos/matriculas/${codigoMatricula}/QuadrosHorarios/Detalhados`, { headers })
      .then((r) => ({ status: r.status, data: r.data }))
      .catch((err) => ({ status: err.response?.status ?? 'erro', data: err.response?.data ?? String(err.message) })),
  ]);

  const resultado = {
    capturadoEm: new Date().toISOString(),
    codigoAluno,
    codigoMatricula,
    notasAvaliacoesCompleto: notas,
    quadrosHorariosDetalhados: horario,
  };

  const outDir = path.resolve(__dirname, '../documentacao/capturas');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `notas-horario-aluno-${codigoAluno}.json`);
  fs.writeFileSync(outFile, JSON.stringify(resultado, null, 2), 'utf8');

  console.log(`\nNotas       -> status ${notas.status}`);
  console.log(`Horário     -> status ${horario.status}`);
  console.log(`\nPayload completo salvo em: ${outFile}`);
  console.log('Compare os campos reais com EtapaGenerica/DisciplinaGenerica em app/portal-do-aluno/(protegido)/notas|horario/page.tsx.');
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
