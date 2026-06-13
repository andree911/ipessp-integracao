export interface EmailData {
  nomeAluno: string;
  nomeResponsavel: string;
  descricao: string;
  valor: string;
  vencimento: string;
  diasRestantes?: number;
  diasAtraso?: number;
  codigoBarras?: string;
  urlBoleto?: string;
  codigoPix?: string;
  nomeEscola: string;
  emailEscola: string;
  telefoneEscola?: string;
  logoUrl?: string;
}

function base(titulo: string, corTopo: string, corpo: string, data: EmailData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- Topo colorido -->
        <tr>
          <td style="background:${corTopo};padding:28px 40px;">
            ${data.logoUrl ? `<img src="${data.logoUrl}" alt="${data.nomeEscola}" style="height:48px;margin-bottom:12px;display:block;">` : ''}
            <p style="margin:0;color:#ffffff;font-size:22px;font-weight:bold;">${data.nomeEscola}</p>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">${titulo}</p>
          </td>
        </tr>

        <!-- Corpo -->
        <tr>
          <td style="padding:36px 40px;">
            ${corpo}
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="background:#f4f6f9;padding:20px 40px;border-top:1px solid #e8ecf0;">
            <p style="margin:0;font-size:12px;color:#8a94a6;line-height:1.6;">
              Em caso de dúvidas, entre em contato conosco:<br>
              ${data.telefoneEscola ? `📞 ${data.telefoneEscola} &nbsp;|&nbsp; ` : ''}
              ✉️ <a href="mailto:${data.emailEscola}" style="color:#8a94a6;">${data.emailEscola}</a>
            </p>
            <p style="margin:10px 0 0;font-size:11px;color:#b0b8c4;">
              Este é um e-mail automático. Por favor, não responda diretamente a esta mensagem.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function blocoValor(data: EmailData): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#f8fafc;border-radius:8px;border:1px solid #e8ecf0;">
    <tr>
      <td style="padding:20px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:13px;color:#6b7a8d;padding-bottom:4px;">Descrição</td>
            <td style="font-size:13px;color:#6b7a8d;padding-bottom:4px;text-align:right;">Vencimento</td>
          </tr>
          <tr>
            <td style="font-size:15px;color:#1a2332;font-weight:bold;">${data.descricao}</td>
            <td style="font-size:15px;color:#1a2332;font-weight:bold;text-align:right;">${data.vencimento}</td>
          </tr>
          <tr><td colspan="2" style="padding:12px 0;"><hr style="border:none;border-top:1px solid #e8ecf0;margin:0;"></td></tr>
          <tr>
            <td style="font-size:13px;color:#6b7a8d;">Aluno</td>
            <td style="font-size:24px;color:#1a2332;font-weight:bold;text-align:right;">${data.valor}</td>
          </tr>
          <tr>
            <td style="font-size:15px;color:#1a2332;">${data.nomeAluno}</td>
            <td></td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function blocoCodigoBarras(codigoBarras: string): string {
  return `
  <div style="margin:20px 0;padding:16px 20px;background:#fff8e6;border-radius:8px;border:1px solid #ffd966;">
    <p style="margin:0 0 6px;font-size:12px;color:#8a6d00;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">Linha Digitável do Boleto</p>
    <p style="margin:0;font-size:13px;color:#1a2332;font-family:monospace;word-break:break-all;">${codigoBarras}</p>
  </div>`;
}

function blocoPix(codigoPix: string): string {
  return `
  <div style="margin:20px 0;padding:16px 20px;background:#e8f5e9;border-radius:8px;border:1px solid #a5d6a7;">
    <p style="margin:0 0 6px;font-size:12px;color:#1b5e20;font-weight:bold;text-transform:uppercase;letter-spacing:0.5px;">🔑 Código PIX (Copia e Cola)</p>
    <p style="margin:0;font-size:13px;color:#1a2332;font-family:monospace;word-break:break-all;">${codigoPix}</p>
  </div>`;
}

function botaoPagar(url: string): string {
  return `
  <div style="margin:24px 0;text-align:center;">
    <a href="${url}" target="_blank"
       style="display:inline-block;padding:14px 36px;background:#2563eb;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;border-radius:6px;">
      Pagar Boleto Online
    </a>
  </div>`;
}

// ─── Template: Lembrete (X dias antes) ───────────────────────────────────────
export function templateLembrete(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Lembrete: boleto vence em ${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}`;

  const corpo = `
    <p style="margin:0 0 8px;font-size:15px;color:#1a2332;">Olá, <strong>${data.nomeResponsavel}</strong>!</p>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
      Passamos para lembrar que você tem um boleto com vencimento em
      <strong>${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}</strong>.
      Realize o pagamento em dia para evitar juros e multas.
    </p>

    ${blocoValor(data)}
    ${data.urlBoleto ? botaoPagar(data.urlBoleto) : ''}
    ${data.codigoBarras ? blocoCodigoBarras(data.codigoBarras) : ''}
    ${data.codigoPix ? blocoPix(data.codigoPix) : ''}

    <p style="margin:24px 0 0;font-size:13px;color:#6b7a8d;line-height:1.6;">
      💡 <strong>Dica:</strong> Se já realizou o pagamento, desconsidere este aviso.
      O sistema pode levar até 2 dias úteis para processar a compensação.
    </p>`;

  return { subject, html: base(subject, '#2563eb', corpo, data) };
}

// ─── Template: Vencimento hoje ────────────────────────────────────────────────
export function templateVencimentoHoje(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Seu boleto vence HOJE`;

  const corpo = `
    <p style="margin:0 0 8px;font-size:15px;color:#1a2332;">Olá, <strong>${data.nomeResponsavel}</strong>!</p>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
      Seu boleto <strong>vence hoje</strong>. Para evitar juros e multas,
      efetue o pagamento até o final do dia de hoje.
    </p>

    ${blocoValor(data)}
    ${data.urlBoleto ? botaoPagar(data.urlBoleto) : ''}
    ${data.codigoBarras ? blocoCodigoBarras(data.codigoBarras) : ''}
    ${data.codigoPix ? blocoPix(data.codigoPix) : ''}

    <div style="margin:24px 0;padding:16px 20px;background:#fff0f0;border-radius:8px;border:1px solid #fca5a5;">
      <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
        ⚠️ Após o vencimento, o boleto poderá ser reapresentado com acréscimos de juros e multa
        conforme contrato.
      </p>
    </div>

    <p style="margin:0;font-size:13px;color:#6b7a8d;">
      Se já realizou o pagamento hoje, desconsidere este aviso.
    </p>`;

  return { subject, html: base(subject, '#d97706', corpo, data) };
}

// ─── Template: Cobrança (após vencimento) ────────────────────────────────────
export function templateCobranca(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Boleto em atraso — ${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}`;

  const corpo = `
    <p style="margin:0 0 8px;font-size:15px;color:#1a2332;">Olá, <strong>${data.nomeResponsavel}</strong>!</p>
    <p style="margin:0 0 24px;font-size:15px;color:#4a5568;line-height:1.6;">
      Identificamos que o boleto abaixo está em aberto há <strong>${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}</strong>
      após o vencimento. Regularize sua situação o quanto antes para evitar maiores encargos.
    </p>

    ${blocoValor(data)}
    ${data.urlBoleto ? botaoPagar(data.urlBoleto) : ''}
    ${data.codigoBarras ? blocoCodigoBarras(data.codigoBarras) : ''}
    ${data.codigoPix ? blocoPix(data.codigoPix) : ''}

    <div style="margin:24px 0;padding:16px 20px;background:#fef2f2;border-radius:8px;border:1px solid #fca5a5;">
      <p style="margin:0;font-size:13px;color:#991b1b;line-height:1.6;">
        ❗ O não pagamento pode resultar em <strong>juros, multa e encaminhamento para
        cobrança</strong> conforme as condições do seu contrato.
      </p>
    </div>

    <p style="margin:0;font-size:14px;color:#4a5568;line-height:1.6;">
      Caso tenha dificuldades para efetuar o pagamento, entre em contato conosco.
      Estamos à disposição para encontrar a melhor solução.
    </p>`;

  return { subject, html: base(subject, '#dc2626', corpo, data) };
}
