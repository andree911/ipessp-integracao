/**
 * Testa o envio de email com dados reais do Sophia.
 *
 * Uso:
 *   npx ts-node scripts/test-email-sophia.ts <codigo_aluno> [email@destino.com] [--preview]
 *
 * Exemplos:
 *   npx ts-node scripts/test-email-sophia.ts 12345 --preview
 *   npx ts-node scripts/test-email-sophia.ts 12345 fulano@gmail.com
 */

import axios from 'axios';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import {
  templateCobranca,
  templateLembrete,
  templateVencimentoHoje,
  type EmailData,
} from '../src/email/templates/email.templates';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const BASE    = process.env.SOPHIA_BASE_URL!;
const TENANT  = process.env.SOPHIA_TENANT ?? '';
const API     = TENANT ? `${BASE}/${TENANT}/api/v1` : `${BASE}/api/v1`;

async function autenticar(): Promise<string> {
  const url = `${API}/Autenticacao`;
  const { data } = await axios.post<string>(
    url,
    { usuario: process.env.SOPHIA_USUARIO, senha: process.env.SOPHIA_SENHA },
    { headers: { 'Content-Type': 'application/json', accept: 'text/plain' } },
  );
  return String(data).replace(/"/g, '').trim();
}

function formatarCompetencia(c: string): string {
  const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho',
                 'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
  const m = c.match(/(\d{4})[-/](\d{2})|(\d{2})[-/](\d{4})/);
  if (!m) return c;
  const ano = m[1] ?? m[4];
  const mes = m[2] ?? m[3];
  const idx = parseInt(mes, 10) - 1;
  return idx >= 0 && idx < 12 ? `${meses[idx]}/${ano}` : c;
}

async function main() {
  const args        = process.argv.slice(2);
  const codigoAluno = parseInt(args[0], 10);
  const destinatario = args.find(a => a.includes('@') && !a.startsWith('-'));
  const soPreview    = args.includes('--preview') || !destinatario;

  if (!codigoAluno || isNaN(codigoAluno)) {
    console.error('Uso: npx ts-node scripts/test-email-sophia.ts <codigo_aluno> [email@destino.com] [--preview]');
    process.exit(1);
  }

  // ── Autenticação ──────────────────────────────────────────────────────────
  console.log('Autenticando no Sophia...');
  const token = await autenticar();
  const headers = { token };

  // ── Aluno ─────────────────────────────────────────────────────────────────
  console.log(`Buscando aluno ${codigoAluno}...`);
  const { data: alunos } = await axios.get(`${API}/Alunos`, {
    headers,
    params: { Pagina: 1, TamanhoPagina: 500 },
  });
  const aluno = alunos.find((a: any) => a.codigo === codigoAluno);
  if (!aluno) {
    console.error(`Aluno ${codigoAluno} não encontrado.`);
    process.exit(1);
  }

  // ── Responsável financeiro ────────────────────────────────────────────────
  const { data: responsaveis } = await axios.get(
    `${API}/alunos/${codigoAluno}/responsaveis`,
    { headers },
  );
  const resp = responsaveis.find((r: any) => r.responsavelFinanceiro) ?? responsaveis[0];
  if (!resp?.email) {
    console.error('Responsável financeiro sem e-mail cadastrado.');
    process.exit(1);
  }

  // ── Lançamentos em aberto ─────────────────────────────────────────────────
  const { data: lancamentos } = await axios.get(
    `${API}/alunos/${codigoAluno}/Lancamentos`,
    { headers },
  );
  const abertos = lancamentos.filter((l: any) => !l.recebido || l.recebido === 0);
  if (abertos.length === 0) {
    console.log('Nenhum lançamento em aberto para este aluno.');
    process.exit(0);
  }

  // Usa o primeiro lançamento em aberto (ordena por vencimento asc)
  abertos.sort((a: any, b: any) =>
    new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime(),
  );
  const lanc = abertos[0];

  // ── Cálculo de dias ───────────────────────────────────────────────────────
  const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
  const venc = new Date(lanc.dataVencimento); venc.setHours(0, 0, 0, 0);
  const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

  // ── Monta EmailData ───────────────────────────────────────────────────────
  const emailData: EmailData = {
    nomeAluno:        aluno.nome,
    nomeResponsavel:  resp.nome,
    descricao:        lanc.descricao ?? 'Mensalidade',
    valor:            `R$ ${(lanc.valorPrevisto as number).toFixed(2).replace('.', ',')}`,
    vencimento:       venc.toLocaleDateString('pt-BR'),
    diasRestantes:    diffDias > 0 ? diffDias : undefined,
    diasAtraso:       diffDias < 0 ? Math.abs(diffDias) : undefined,
    codigoBarras:     lanc.linhaDigitavel,
    urlBoleto:        lanc.urlBoletoDigital,
    codigoPix:        lanc.codigoPix,
    codigoMatricula:  String(aluno.codigo),
    competencia:      lanc.competencia ? formatarCompetencia(lanc.competencia) : undefined,
    nomeEscola:       process.env.ESCOLA_NOME ?? 'IPESSP',
    emailEscola:      (process.env.SMTP_FROM ?? '').replace(/^.*<(.+)>$/, '$1'),
    telefoneEscola:   process.env.ESCOLA_TELEFONE,
    logoUrl:          process.env.EMAIL_LOGO_URL,
    siteUrl:          process.env.ESCOLA_SITE,
    instagramUrl:     process.env.ESCOLA_INSTAGRAM,
    facebookUrl:      process.env.ESCOLA_FACEBOOK,
    youtubeUrl:       process.env.ESCOLA_YOUTUBE,
    linkedinUrl:      process.env.ESCOLA_LINKEDIN,
    cnpj:             process.env.ESCOLA_CNPJ,
    endereco:         process.env.ESCOLA_ENDERECO,
    linkPortalAluno:  process.env.ESCOLA_SITE,
    linkSegundaVia:   lanc.urlBoletoDigital,
  };

  // ── Escolhe o template ────────────────────────────────────────────────────
  let tpl: { subject: string; html: string };
  if (diffDias === 0)    tpl = templateVencimentoHoje(emailData);
  else if (diffDias > 0) tpl = templateLembrete(emailData);
  else                   tpl = templateCobranca(emailData);

  const tipo = diffDias === 0 ? 'vencimento_hoje' : diffDias > 0 ? 'lembrete' : 'cobranca';

  console.log(`
Aluno:       ${aluno.nome} (código: ${aluno.codigo})
Responsável: ${resp.nome} <${resp.email}>
Lançamento:  ${lanc.descricao ?? '-'} — ${emailData.valor} — venc. ${emailData.vencimento} (${diffDias >= 0 ? '+' : ''}${diffDias}d)
Tipo email:  ${tipo}
Subject:     ${tpl.subject}
  `);

  // ── Preview ou envio ──────────────────────────────────────────────────────
  if (soPreview) {
    const outDir = path.resolve(__dirname, '../email-preview');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);
    const outFile = path.join(outDir, 'sophia-preview.html');
    fs.writeFileSync(outFile, tpl.html, 'utf8');
    console.log(`Preview salvo em: ${outFile}`);
    console.log('Abra no browser para visualizar.');
    return;
  }

  console.log('Verificando conexão SMTP...');
  const transporter = nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.verify();
  console.log('SMTP OK');

  await transporter.sendMail({
    from:    process.env.SMTP_FROM,
    to:      destinatario,
    subject: tpl.subject,
    html:    tpl.html,
  });
  console.log(`Email enviado para ${destinatario}`);
}

main().catch(err => {
  console.error('Erro:', err.message);
  process.exit(1);
});
