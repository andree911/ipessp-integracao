import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { templateCobranca } from '../src/email/templates/email.templates';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  const destinatario = process.argv[2];
  if (!destinatario) {
    console.error('Uso: npx ts-node scripts/test-email.ts seu@email.com');
    process.exit(1);
  }

  console.log('Verificando conexão SMTP...');
  await transporter.verify();
  console.log('SMTP OK');

  const { subject, html } = templateCobranca({
    nomeAluno: 'João da Silva',
    nomeResponsavel: 'Maria da Silva',
    descricao: 'Mensalidade Junho/2026',
    valor: 'R$ 850,00',
    vencimento: '15/06/2026',
    diasAtraso: 5,
    codigoBarras: '23793.38128 60007.030938 71000.063305 9 10010000085000',
    urlBoleto: 'https://boleto.exemplo.com/pay/abc123',
    codigoPix: '00020126580014br.gov.bcb.pix0136abc123',
    nomeEscola: process.env.ESCOLA_NOME ?? 'IPESSP',
    emailEscola: process.env.SMTP_FROM ?? '',
    telefoneEscola: process.env.ESCOLA_TELEFONE,
    logoUrl: process.env.EMAIL_LOGO_URL,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: destinatario,
    subject,
    html,
  });

  console.log(`Email enviado para ${destinatario}`);
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
