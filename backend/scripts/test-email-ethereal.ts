import * as nodemailer from 'nodemailer';
import { templateLembrete } from '../src/email/templates/email.templates';

async function main() {
  const conta = await nodemailer.createTestAccount();
  console.log('Conta Ethereal criada:', conta.user);

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: { user: conta.user, pass: conta.pass },
  });

  const { subject, html } = templateLembrete({
    nomeAluno: 'João da Silva',
    nomeResponsavel: 'Maria da Silva',
    descricao: 'Mensalidade Junho/2026',
    valor: 'R$ 850,00',
    vencimento: '15/06/2026',
    diasRestantes: 3,
    codigoBarras: '23793.38128 60007.030938 71000.063305 9 10010000085000',
    urlBoleto: 'https://boleto.exemplo.com/pay/abc123',
    codigoPix: '00020126580014br.gov.bcb.pix0136abc123',
    nomeEscola: 'IPESSP',
    emailEscola: 'matricula.financeiro@ipessp.edu.br',
    telefoneEscola: '(11) 99839-3640',
    logoUrl: 'https://oylhowadealxvsmdhmzc.supabase.co/storage/v1/object/public/assets/logo.png',
  });

  const info = await transporter.sendMail({
    from: '"IPESSP" <matricula.financeiro@ipessp.edu.br>',
    to: 'teste@ipessp.edu.br',
    subject,
    html,
  });

  console.log('\nEmail enviado com sucesso!');
  console.log('Abra no navegador para visualizar:');
  console.log(nodemailer.getTestMessageUrl(info));
}

main().catch((err) => {
  console.error('Erro:', err.message);
  process.exit(1);
});
