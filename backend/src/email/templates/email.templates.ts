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

const COR = '#C8102E';

// Ícones como tabelas coloridas — funcionam em Outlook, Gmail e todos os clientes
function iconeCirculo(letra: string, cor: string, bg: string): string {
  return `<table cellpadding="0" cellspacing="0" style="display:inline-table;"><tr><td style="width:28px;height:28px;background:${bg};border-radius:50%;text-align:center;vertical-align:middle;font-size:14px;font-weight:bold;color:${cor};font-family:Arial,sans-serif;line-height:28px;">${letra}</td></tr></table>`;
}

function base(titulo: string, subtitulo: string, corpo: string, data: EmailData): string {
  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <title>${titulo}</title>
  <style>
    :root { color-scheme: light only; }
    body { margin:0!important; padding:0!important; background-color:#f0f2f5!important; }
    table { border-collapse:collapse; }
    .bg-white { background-color:#ffffff!important; }
    .bg-red { background-color:${COR}!important; }
    .bg-gray { background-color:#f0f2f5!important; }
    .bg-footer { background-color:#f8f9fb!important; }
    .bg-card { background-color:#fafbfc!important; }
    .bg-yellow { background-color:#fffbeb!important; }
    .bg-red-light { background-color:#fff5f5!important; }
    .bg-green { background-color:#f0fdf4!important; }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;" bgcolor="#f0f2f5">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f2f5" style="background-color:#f0f2f5;padding:32px 8px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" class="bg-white" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- Cabeçalho vermelho -->
        <tr>
          <td align="center" class="bg-red" style="background-color:${COR};padding:36px 40px 30px;">
            ${data.logoUrl ? `
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
              <tr><td align="center" style="background:#ffffff;border-radius:10px;padding:8px 16px;line-height:0;">
                <img src="${data.logoUrl}" alt="${data.nomeEscola}" height="48" style="height:48px;width:auto;display:block;border:0;">
              </td></tr>
            </table>` : ''}
            <p style="margin:0 0 6px;color:#ffffff;font-size:20px;font-weight:bold;font-family:Arial,sans-serif;">${data.nomeEscola}</p>
            <p style="margin:0;color:rgba(255,255,255,0.80);font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;font-family:Arial,sans-serif;">${subtitulo}</p>
          </td>
        </tr>

        <!-- Corpo -->
        <tr>
          <td class="bg-white" style="background-color:#ffffff;padding:36px 40px 28px;">
            ${corpo}
          </td>
        </tr>

        <!-- Divisor -->
        <tr>
          <td class="bg-white" style="background-color:#ffffff;padding:0 40px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr><td style="height:1px;background-color:#edf0f4;font-size:0;line-height:0;">&nbsp;</td></tr>
            </table>
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td class="bg-footer" style="background-color:#f8f9fb;padding:20px 40px;border-radius:0 0 12px 12px;">
            <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:6px;">
              <tr>
                ${data.telefoneEscola ? `
                <td style="padding-right:20px;white-space:nowrap;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td valign="middle">
                      <!--[if mso]><v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:22px;height:22px;" fillcolor="#C8102E" stroked="false"><v:textbox inset="0,2px,0,0" style="mso-fit-shape-to-text:false;"><center><span style="font-family:Arial;font-size:12px;font-weight:bold;color:#ffffff;">T</span></center></v:textbox></v:oval><![endif]-->
                      <!--[if !mso]><!--><span style="display:inline-block;width:22px;height:22px;background-color:#C8102E;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">T</span><!--<![endif]-->
                    </td>
                    <td style="padding-left:7px;font-size:12px;color:#6b7a8d;font-family:Arial,sans-serif;vertical-align:middle;">${data.telefoneEscola}</td>
                  </tr></table>
                </td>` : ''}
                <td style="white-space:nowrap;">
                  <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td valign="middle">
                      <!--[if mso]><v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:22px;height:22px;" fillcolor="#C8102E" stroked="false"><v:textbox inset="0,2px,0,0" style="mso-fit-shape-to-text:false;"><center><span style="font-family:Arial;font-size:12px;font-weight:bold;color:#ffffff;">@</span></center></v:textbox></v:oval><![endif]-->
                      <!--[if !mso]><!--><span style="display:inline-block;width:22px;height:22px;background-color:#C8102E;border-radius:50%;text-align:center;line-height:22px;font-size:12px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">@</span><!--<![endif]-->
                    </td>
                    <td style="padding-left:7px;font-size:12px;font-family:Arial,sans-serif;vertical-align:middle;">
                      <a href="mailto:${data.emailEscola}" style="color:#6b7a8d;text-decoration:none;">${data.emailEscola}</a>
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:#b0b8c9;font-family:Arial,sans-serif;line-height:1.5;">
              Este e-mail foi gerado automaticamente pelo sistema financeiro. Por favor, n&#227;o responda diretamente a esta mensagem.
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
  <table width="100%" cellpadding="0" cellspacing="0" border="0" class="bg-card" style="margin:24px 0;background-color:#fafbfc;border-radius:10px;border:1px solid #edf0f4;">
    <tr>
      <td style="padding:22px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="50%" style="padding-bottom:2px;">
              <span style="font-size:10px;color:#9aa4b2;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Descri&#231;&#227;o</span>
            </td>
            <td width="50%" align="right" style="padding-bottom:2px;">
              <span style="font-size:10px;color:#9aa4b2;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Vencimento</span>
            </td>
          </tr>
          <tr>
            <td>
              <span style="font-size:15px;color:#1a2332;font-weight:bold;font-family:Arial,sans-serif;">${data.descricao}</span>
            </td>
            <td align="right">
              <span style="font-size:15px;color:#1a2332;font-weight:bold;font-family:Arial,sans-serif;">${data.vencimento}</span>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:14px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="height:1px;background:#edf0f4;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td valign="bottom">
              <span style="display:block;font-size:10px;color:#9aa4b2;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;margin-bottom:3px;">Aluno</span>
              <span style="font-size:14px;color:#1a2332;font-family:Arial,sans-serif;">${data.nomeAluno}</span>
            </td>
            <td align="right" valign="bottom">
              <span style="display:block;font-size:10px;color:#9aa4b2;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;margin-bottom:3px;">Valor</span>
              <span style="font-size:28px;color:${COR};font-weight:bold;font-family:Arial,sans-serif;line-height:1;">${data.valor}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function botaoPagar(url: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0;">
    <tr>
      <td align="center">
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
          href="${url}" style="height:50px;v-text-anchor:middle;width:240px;" arcsize="10%"
          strokecolor="${COR}" fillcolor="${COR}">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">Pagar Boleto Online</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${url}" target="_blank"
           style="display:inline-block;background-color:${COR};color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:15px 48px;border-radius:8px;font-family:Arial,sans-serif;mso-hide:all;">
          Pagar Boleto Online
        </a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>`;
}

function blocoCodigoBarras(codigoBarras: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0;">
    <tr>
      <td class="bg-yellow" style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="32" valign="top" style="padding-right:10px;padding-top:2px;">
              ${iconeCirculo('&#9650;', '#92400e', '#fde68a')}
            </td>
            <td>
              <span style="display:block;font-size:10px;color:#92400e;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;margin-bottom:8px;">Linha Digit&#225;vel do Boleto</span>
              <span style="font-size:12px;color:#1a2332;font-family:'Courier New',Courier,monospace;word-break:break-all;line-height:1.7;">${codigoBarras}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function blocoPix(codigoPix: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:10px 0;">
    <tr>
      <td class="bg-green" style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="padding-bottom:8px;">
              <span style="display:inline-block;background:#00B894;color:#ffffff;font-size:11px;font-weight:bold;padding:3px 10px;border-radius:4px;font-family:Arial,sans-serif;letter-spacing:0.5px;">PIX</span>
              <span style="font-size:10px;color:#14532d;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;margin-left:8px;">C&#243;digo Copia e Cola</span>
            </td>
          </tr>
          <tr>
            <td>
              <span style="font-size:12px;color:#1a2332;font-family:'Courier New',Courier,monospace;word-break:break-all;line-height:1.7;">${codigoPix}</span>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function blocoAviso(icone: string, cor: string, bgCor: string, bordaCor: string, texto: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0;">
    <tr>
      <td style="background:${bgCor};border:1px solid ${bordaCor};border-radius:8px;padding:15px 18px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="38" valign="top" style="padding-right:10px;padding-top:2px;">${icone}</td>
            <td style="font-size:13px;color:${cor};line-height:1.6;font-family:Arial,sans-serif;">${texto}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ─── Template: Lembrete (X dias antes) ───────────────────────────────────────
export function templateLembrete(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Lembrete: boleto vence em ${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}`;

  const corpo = `
    <p style="margin:0 0 4px;font-size:16px;color:#1a2332;font-weight:bold;font-family:Arial,sans-serif;">Ol&#225;, ${data.nomeResponsavel}!</p>
    <p style="margin:0 0 4px;font-size:14px;color:#4a5568;line-height:1.7;font-family:Arial,sans-serif;">
      Voc&#234; tem um boleto com vencimento em <strong style="color:${COR};">${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}</strong>.
      Efetue o pagamento em dia para evitar juros e multas.
    </p>

    ${blocoValor(data)}

    ${blocoAviso(
      iconeCirculo('i', '#6b4c00', '#fde68a'),
      '#6b4c00',
      '#fffbeb',
      '#fde68a',
      `Seu boleto vence em <strong>${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}</strong>. Realize o pagamento at&#233; a data de vencimento para evitar encargos adicionais.`,
    )}

    ${data.urlBoleto ? botaoPagar(data.urlBoleto) : ''}
    ${data.codigoBarras ? blocoCodigoBarras(data.codigoBarras) : ''}
    ${data.codigoPix ? blocoPix(data.codigoPix) : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
      <tr>
        <td style="font-size:12px;color:#9aa4b2;line-height:1.7;font-family:Arial,sans-serif;">
          * Se j&#225; realizou o pagamento, desconsidere este aviso. O sistema pode levar at&#233; 2 dias &#250;teis para processar a compensa&#231;&#227;o.
        </td>
      </tr>
    </table>`;

  return { subject, html: base(subject, 'Lembrete de Vencimento', corpo, data) };
}

// ─── Template: Vencimento hoje ────────────────────────────────────────────────
export function templateVencimentoHoje(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Seu boleto vence HOJE`;

  const corpo = `
    <p style="margin:0 0 4px;font-size:16px;color:#1a2332;font-weight:bold;font-family:Arial,sans-serif;">Ol&#225;, ${data.nomeResponsavel}!</p>
    <p style="margin:0 0 4px;font-size:14px;color:#4a5568;line-height:1.7;font-family:Arial,sans-serif;">
      Seu boleto <strong style="color:${COR};">vence hoje</strong>. Efetue o pagamento at&#233; o final do dia para evitar juros e multas.
    </p>

    ${blocoValor(data)}

    ${blocoAviso(
      iconeCirculo('!', '#92400e', '#fde68a'),
      '#92400e',
      '#fffbeb',
      '#fde68a',
      `<strong>Vencimento hoje!</strong> Ap&#243;s o vencimento, o boleto poder&#225; ser reapresentado com acr&#233;scimos de juros e multa conforme contrato.`,
    )}

    ${data.urlBoleto ? botaoPagar(data.urlBoleto) : ''}
    ${data.codigoBarras ? blocoCodigoBarras(data.codigoBarras) : ''}
    ${data.codigoPix ? blocoPix(data.codigoPix) : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
      <tr>
        <td style="font-size:12px;color:#9aa4b2;line-height:1.7;font-family:Arial,sans-serif;">
          * Se j&#225; realizou o pagamento hoje, desconsidere este aviso.
        </td>
      </tr>
    </table>`;

  return { subject, html: base(subject, 'Vencimento Hoje', corpo, data) };
}

// ─── Template: Cobrança (após vencimento) ────────────────────────────────────
export function templateCobranca(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Boleto em atraso &#8212; ${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}`;

  const corpo = `
    <p style="margin:0 0 4px;font-size:16px;color:#1a2332;font-weight:bold;font-family:Arial,sans-serif;">Ol&#225;, ${data.nomeResponsavel}!</p>
    <p style="margin:0 0 4px;font-size:14px;color:#4a5568;line-height:1.7;font-family:Arial,sans-serif;">
      Identificamos que o boleto abaixo est&#225; em aberto h&#225; <strong style="color:${COR};">${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}</strong> ap&#243;s o vencimento.
      Regularize sua situa&#231;&#227;o o quanto antes para evitar maiores encargos.
    </p>

    ${blocoValor(data)}

    ${blocoAviso(
      iconeCirculo('!', '#991b1b', '#fecaca'),
      '#991b1b',
      '#fff5f5',
      '#fecaca',
      `<strong>Boleto em atraso h&#225; ${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}.</strong> O n&#227;o pagamento pode resultar em <strong>juros, multa e encaminhamento para cobran&#231;a</strong> conforme as condi&#231;&#245;es do seu contrato.`,
    )}

    ${data.urlBoleto ? botaoPagar(data.urlBoleto) : ''}
    ${data.codigoBarras ? blocoCodigoBarras(data.codigoBarras) : ''}
    ${data.codigoPix ? blocoPix(data.codigoPix) : ''}

    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:20px;">
      <tr>
        <td style="font-size:13px;color:#4a5568;line-height:1.7;font-family:Arial,sans-serif;">
          Caso tenha dificuldades para efetuar o pagamento, entre em contato conosco. Estamos &#224; disposi&#231;&#227;o para encontrar a melhor solu&#231;&#227;o.
        </td>
      </tr>
    </table>`;

  return { subject, html: base(subject, 'Aviso de Cobran&#231;a', corpo, data) };
}
