import * as fs from 'fs';
import * as path from 'path';
import * as QRCode from 'qrcode';
import { templateCobranca } from '../src/email/templates/email.templates';

async function main() {
  const codigoPix = '00020126580014br.gov.bcb.pix0136abc123-def4-5678-ghij-klmnopqrstuv5204000053039865802BR5925Escola Exemplo Ltda6009SAO PAULO62070503***6304ABCD';

  // Mesma chamada usada em produção (email-job.service.ts: gerarQrCode)
  const qrBuffer = await QRCode.toBuffer(codigoPix, { width: 260, margin: 1, type: 'png' });
  const qrDataUri = `data:image/png;base64,${qrBuffer.toString('base64')}`;

  const dadosFake = {
    nomeAluno: 'João da Silva',
    nomeResponsavel: 'Maria da Silva',
    descricao: 'Mensalidade Junho/2026',
    valor: 'R$ 850,00',
    vencimento: '15/06/2026',
    diasAtraso: 5,
    codigoBarras: '23793.38128 60007.030938 71000.063305 9 10010000085000',
    urlBoleto: 'https://boleto.exemplo.com/pay/abc123',
    codigoPix,
    qrCodeUrl: qrDataUri, // em produção isso é `cid:qrpix@email` (anexo inline) — aqui uso data URI só pra visualizar localmente
    codigoMatricula: '10059',
    competencia: '2026-06',
    nomeEscola: 'IPESSP',
    emailEscola: 'matricula.financeiro@ipessp.edu.br',
    telefoneEscola: '(11) 99839-3640',
    logoUrl: 'https://oylhowadealxvsmdhmzc.supabase.co/storage/v1/object/public/assets/logo.png',
    siteUrl: 'https://www.ipessp.edu.br',
  };

  const { subject, html } = templateCobranca(dadosFake as any);
  const outDir = path.resolve(__dirname, '../email-preview');
  fs.writeFileSync(path.join(outDir, 'cobranca_com_qr_real.html'), html, 'utf8');
  console.log(`✔ cobranca_com_qr_real.html — subject: "${subject}"`);
  console.log(`QR gerado: ${qrBuffer.length} bytes`);
}

main();
