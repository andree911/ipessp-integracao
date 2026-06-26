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
  competencia?: string;
  codigoMatricula?: string;
  siteUrl?: string;
  instagramUrl?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  linkedinUrl?: string;
  cnpj?: string;
  endereco?: string;
  curso?: string;
  qrCodeUrl?: string;
  linkPortalAluno?: string;
  linkSegundaVia?: string;
}

const COR = '#C8102E';
// Cor de sobreposição escura equivalente a rgba(0,0,0,0.18) sobre #C8102E
// necessária porque Outlook não suporta rgba()
const COR_DARK = '#a40d26';

// ─── Ícones inline (SVG → base64 data URL) ───────────────────────────────────
// Inline para não depender de CDN externo e não ser bloqueado por email clients.
// Outlook Desktop (VML) recebe fallback em texto nos conditional comments.

function svgIcon(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

const ICO_TEL = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="9" fill="#fff"/><path d="M6 6.2c0-.3.3-.7.7-.7H7c.3 0 .6.2.7.5l.4 1.8c.1.3-.1.6-.4.7l-.5.3c.4.9 1.1 1.6 2 2l.3-.5c.2-.3.5-.4.7-.3l1.8.4c.3.1.5.4.5.7v.4c0 .4-.3.7-.7.7C8.2 12 6 9.8 6 7.3V6.2z" fill="${COR}"/></svg>`,
);
const ICO_EMAIL = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="9" fill="#fff"/><rect x="3.5" y="5.5" width="11" height="8" rx="1" fill="none" stroke="${COR}" stroke-width="1.2"/><polyline points="3.5,6 9,10 14.5,6" fill="none" stroke="${COR}" stroke-width="1.2"/></svg>`,
);
const ICO_SITE = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"><circle cx="9" cy="9" r="9" fill="#fff"/><circle cx="9" cy="9" r="5.5" fill="none" stroke="${COR}" stroke-width="1.2"/><path d="M9 3.5c-1.8 2.5-1.8 8.5 0 11M9 3.5c1.8 2.5 1.8 8.5 0 11" fill="none" stroke="${COR}" stroke-width="1.2"/><line x1="3.5" y1="9" x2="14.5" y2="9" stroke="${COR}" stroke-width="1.2"/></svg>`,
);

const ICO_FACEBOOK = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="#1877F2"/><path d="M22.5 21H25l.5-3H22.5v-1.5c0-1 .3-1.5 1.5-1.5H26v-2.7a22 22 0 0 0-3-.2c-2.6 0-4.5 1.6-4.5 4.5V18H16v3h2.5v8H22v-8z" fill="#fff"/></svg>`,
);
const ICO_INSTAGRAM = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="#E1306C"/><rect x="12" y="12" width="16" height="16" rx="4" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="20" cy="20" r="4.5" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="25.5" cy="14.5" r="1.2" fill="#fff"/></svg>`,
);
const ICO_YOUTUBE = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="#FF0000"/><path d="M28.5 15.5c-.3-1.2-1.3-2-2.5-2.2C23.8 13 20 13 20 13s-3.8 0-6 .3c-1.2.2-2.2 1-2.5 2.2-.3 1.3-.5 2.7-.5 4s.2 2.7.5 4c.3 1.2 1.3 2 2.5 2.2 2.2.3 6 .3 6 .3s3.8 0 6-.3c1.2-.2 2.2-1 2.5-2.2.3-1.3.5-2.7.5-4s-.2-2.7-.5-4zm-11 7v-6l6 3-6 3z" fill="#fff"/></svg>`,
);
const ICO_LINKEDIN = svgIcon(
  `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><circle cx="20" cy="20" r="20" fill="#0A66C2"/><rect x="12" y="17" width="3.5" height="10.5" fill="#fff"/><circle cx="13.75" cy="13.5" r="2" fill="#fff"/><path d="M19 17h3.5v1.5c.5-1 1.8-1.8 3.2-1.8 2.8 0 4.3 1.8 4.3 5v6.3h-3.5v-5.5c0-1.5-.5-2.5-1.8-2.5-1.5 0-2.2 1-2.2 2.8v5.2H19z" fill="#fff"/></svg>`,
);

// ─── 1. Cabeçalho: logo + contatos com ícone + texto ─────────────────────────

function cabecalho(data: EmailData): string {
  const tel = (data.telefoneEscola ?? '').replace(/\D/g, '');

  const contatoLinha = (icone: string, fallbackTxt: string, texto: string, url: string): string => `
  <tr>
    <td style="padding:4px 0;">
      <a href="${url}" target="_blank" style="text-decoration:none;display:inline-block;">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td align="center" valign="middle" style="padding-right:8px;line-height:0;vertical-align:middle;">
              <!--[if mso]><table cellpadding="0" cellspacing="0" border="0"><tr><td bgcolor="#ffffff" style="background:#ffffff;padding:2px 6px;border-radius:3px;"><span style="font-size:9px;font-weight:bold;color:${COR};font-family:Arial,sans-serif;">${fallbackTxt}</span></td></tr></table><![endif]-->
              <!--[if !mso]><!--><img src="${icone}" width="18" height="18" alt="${fallbackTxt}" style="display:block;border:0;"><!--<![endif]-->
            </td>
            <td style="vertical-align:middle;">
              <span style="font-size:12px;color:#ffffff;font-family:Arial,sans-serif;white-space:nowrap;">${texto}</span>
            </td>
          </tr>
        </table>
      </a>
    </td>
  </tr>`;

  const linhas: string[] = [];
  if (data.telefoneEscola) linhas.push(contatoLinha(ICO_TEL,   'TEL',    data.telefoneEscola, `tel:+55${tel}`));
  if (data.emailEscola)    linhas.push(contatoLinha(ICO_EMAIL,  'E-MAIL', data.emailEscola,    `mailto:${data.emailEscola}`));
  if (data.siteUrl)        linhas.push(contatoLinha(ICO_SITE,   'SITE',   data.siteUrl.replace(/^https?:\/\/(www\.)?/, ''), data.siteUrl));

  const logoHtml = data.logoUrl
    ? `<table cellpadding="0" cellspacing="0" border="0">
         <tr>
           <td align="center" style="background:#ffffff;border-radius:10px;padding:8px 16px;line-height:0;">
             ${data.siteUrl ? `<a href="${data.siteUrl}" target="_blank" style="display:block;line-height:0;border:0;">` : ''}
             <img src="${data.logoUrl}" alt="${data.nomeEscola}" height="48"
               style="height:48px;width:auto;display:block;border:0;">
             ${data.siteUrl ? '</a>' : ''}
           </td>
         </tr>
       </table>`
    : `<span style="font-size:22px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${data.nomeEscola}</span>`;

  return `
  <tr>
    <td align="center" bgcolor="${COR}" style="background-color:${COR};padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle">${logoHtml}</td>
          ${linhas.length > 0 ? `
          <td align="right" valign="top" style="padding-top:4px;">
            <table cellpadding="0" cellspacing="0" border="0" align="right">
              ${linhas.join('')}
            </table>
          </td>` : ''}
        </tr>
      </table>
    </td>
  </tr>`;
}

// ─── 3. Card de resumo ────────────────────────────────────────────────────────
// Técnica "faux border": td externo vermelho com padding:2px cria a borda
// compatível com Outlook (sem border-radius no desktop, mas borda vermelha ✅)

function cartaoResumo(data: EmailData): string {
  const temMeta = data.codigoMatricula || data.curso || data.competencia;

  const linhasMeta = temMeta ? `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="top">
            ${data.codigoMatricula ? `
              <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">C&#243;digo do Aluno / RA</span>
              <span style="font-size:14px;color:#222;font-weight:bold;font-family:Arial,sans-serif;">${data.codigoMatricula}</span>
            ` : ''}
            ${data.curso ? `
              <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-top:${data.codigoMatricula ? '8px' : '0'};margin-bottom:2px;">Curso</span>
              <span style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.curso}</span>
            ` : ''}
            ${data.competencia && !data.codigoMatricula && !data.curso ? `
              <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">Compet&#234;ncia</span>
              <span style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.competencia}</span>
            ` : ''}
          </td>
          ${data.competencia && (data.codigoMatricula || data.curso) ? `
          <td valign="top" align="center" style="padding:0 12px;">
            <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">Refer&#234;ncia</span>
            <span style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.competencia}</span>
          </td>` : ''}
          <td valign="top" align="right">
            <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">Vencimento</span>
            <span style="font-size:15px;color:#222;font-weight:bold;font-family:Arial,sans-serif;">${data.vencimento}</span>
          </td>
        </tr></table>
      </td>
    </tr>` : '';

  const linhaAluno = `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td>
            <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">Aluno</span>
            <span style="font-size:14px;color:#222;font-family:Arial,sans-serif;">${data.nomeAluno}</span>
          </td>
          ${!temMeta ? `
          <td align="right">
            <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">Vencimento</span>
            <span style="font-size:15px;color:#222;font-weight:bold;font-family:Arial,sans-serif;">${data.vencimento}</span>
          </td>` : ''}
        </tr></table>
      </td>
    </tr>`;

  const linhaDescricao = data.descricao ? `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
        <span style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-bottom:2px;">Descri&#231;&#227;o</span>
        <span style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.descricao}</span>
      </td>
    </tr>` : '';

  const linhaTotal = `
    <tr>
      <td bgcolor="${COR}" style="background-color:${COR};padding:16px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font-size:15px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">Total a pagar</td>
          <td align="right" style="font-size:26px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;line-height:1;">${data.valor}</td>
        </tr></table>
      </td>
    </tr>`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 24px;">
    <tr>
      <!-- td vermelho com padding:2px = faux border (funciona no Outlook desktop) -->
      <td bgcolor="${COR}" style="background-color:${COR};padding:2px;border-radius:12px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          bgcolor="#ffffff" style="background-color:#ffffff;border-radius:10px;overflow:hidden;">
          ${linhasMeta}
          ${linhaAluno}
          ${linhaDescricao}
          ${linhaTotal}
        </table>
      </td>
    </tr>
  </table>`;
}

// ─── 4. Intro de pagamento ────────────────────────────────────────────────────

function introsPagamento(): string {
  return `
  <p style="margin:0 0 4px;font-size:14px;color:#444;text-align:center;font-family:Arial,sans-serif;line-height:1.6;">
    &#201; simples efetuar o pagamento desta mensalidade.
  </p>
  <p style="margin:0 0 22px;font-size:14px;color:${COR};font-weight:bold;text-align:center;font-family:Arial,sans-serif;">
    Veja as op&#231;&#245;es que temos para voc&#234;:
  </p>`;
}

// ─── 5. Card PIX ─────────────────────────────────────────────────────────────

function secaoPix(data: EmailData): string {
  if (!data.codigoPix) return '';

  const qrBlock = data.qrCodeUrl
    ? `<img src="${data.qrCodeUrl}" alt="QR Code PIX" width="130" height="130"
         style="display:block;border:0;border-radius:8px;background:#ffffff;">`
    : `<table width="130" cellpadding="0" cellspacing="0" border="0"
         style="height:130px;border-radius:8px;overflow:hidden;">
         <tr>
           <td bgcolor="${COR_DARK}" align="center" valign="middle"
             style="background-color:${COR_DARK};border-radius:8px;text-align:center;vertical-align:middle;padding:10px;">
             <span style="font-size:10px;color:#ffb3be;font-family:Arial,sans-serif;line-height:1.5;">QR Code<br>PIX</span>
           </td>
         </tr>
       </table>`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border-radius:12px;overflow:hidden;margin:0 0 16px;">
    <tr>
      <td bgcolor="${COR}" style="background-color:${COR};padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">PIX</p>
        <p style="margin:0 0 16px;font-size:13px;color:#ffcccc;font-family:Arial,sans-serif;line-height:1.5;">
          Acesse o app do seu banco ou Carteira Digital, aponte a c&#226;mera para o QR Code
          ou copie e cole o c&#243;digo PIX e pronto!
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="150" valign="top" align="center" style="padding-right:16px;">
              ${qrBlock}
              <p style="margin:6px 0 0;font-size:9px;color:#ffb3be;font-family:Arial,sans-serif;">QR Code</p>
            </td>
            <td valign="top">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td bgcolor="${COR_DARK}" style="background-color:${COR_DARK};border-radius:8px;padding:14px 16px;">
                    <p style="margin:0 0 6px;font-size:10px;color:#ffb3be;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Pix copia e cola</p>
                    <p style="margin:0;font-size:12px;color:#ffffff;font-family:'Courier New',Courier,monospace;word-break:break-all;line-height:1.8;">${data.codigoPix}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ─── 6. Card Boleto ───────────────────────────────────────────────────────────

function secaoBoleto(codigo: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="border-radius:12px;overflow:hidden;margin:0 0 16px;">
    <tr>
      <td bgcolor="${COR}" style="background-color:${COR};padding:20px 24px;">
        <p style="margin:0 0 4px;font-size:16px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">BOLETO / C&#211;DIGO DE BARRAS</p>
        <p style="margin:0 0 16px;font-size:13px;color:#ffcccc;font-family:Arial,sans-serif;">
          Utilize o c&#243;digo abaixo para pagar no app do seu banco ou internet banking.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td bgcolor="${COR_DARK}" style="background-color:${COR_DARK};border-radius:8px;padding:14px 16px;">
              <p style="margin:0 0 6px;font-size:10px;color:#ffb3be;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Linha Digit&#225;vel</p>
              <p style="margin:0;font-size:13px;color:#ffffff;font-family:'Courier New',Courier,monospace;word-break:break-all;line-height:1.9;">${codigo}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

// ─── 7. Dois CTAs lado a lado ────────────────────────────────────────────────
// Bordas via mso-border-*-alt para garantir renderização no Outlook desktop

function doisCtas(data: EmailData): string {
  const portalUrl = data.linkPortalAluno ?? data.siteUrl ?? '#';
  const segundaUrl = data.linkSegundaVia ?? data.urlBoleto ?? portalUrl;

  const botaoCta = (url: string): string => `
    <!--[if mso]>
    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
      href="${url}" style="height:38px;v-text-anchor:middle;width:200px;" arcsize="50%"
      strokecolor="${COR}" fillcolor="${COR}">
      <w:anchorlock/>
      <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">Clique aqui</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <a href="${url}" target="_blank"
      style="display:inline-block;background-color:${COR};color:#ffffff;font-size:13px;font-weight:bold;text-decoration:none;padding:10px 22px;border-radius:20px;font-family:Arial,sans-serif;mso-hide:all;">
      Clique aqui
    </a>
    <!--<![endif]-->`;

  const miniCard = (titulo: string, texto: string, url: string): string => `
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td style="border:1.5px solid #e0e0e0;padding:0;border-radius:12px;
                 mso-border-top-alt:solid #e0e0e0 1.5pt;mso-border-right-alt:solid #e0e0e0 1.5pt;
                 mso-border-bottom-alt:solid #e0e0e0 1.5pt;mso-border-left-alt:solid #e0e0e0 1.5pt;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px;overflow:hidden;">
          <tr>
            <td bgcolor="${COR}" style="background-color:${COR};padding:11px 16px;">
              <span style="font-size:11px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif;">${titulo}</span>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" style="background-color:#ffffff;padding:14px 16px 16px;">
              <p style="margin:0 0 14px;font-size:13px;color:#444;line-height:1.5;font-family:Arial,sans-serif;">${texto}</p>
              ${botaoCta(url)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;

  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
    <tr>
      <td width="48%" valign="top" class="col-cta">
        ${miniCard(
          'PIX AUTOM&#193;TICO',
          'Com a fatura digital e Pix autom&#225;tico, voc&#234; facilita muito mais a sua vida.',
          portalUrl,
        )}
      </td>
      <td width="4%" class="col-gap">&nbsp;</td>
      <td width="48%" valign="top" class="col-cta">
        ${miniCard(
          '2&#170; VIA / PAGAR AGORA',
          'Acesse e pague sua fatura diretamente pelo link de segunda via do boleto.',
          segundaUrl,
        )}
      </td>
    </tr>
  </table>`;
}

// ─── 8. Aviso de segurança ────────────────────────────────────────────────────
// bgcolor no <td> (não na <table>) para garantir compatibilidade com Outlook

function avisoSeguranca(data: EmailData): string {
  const emailDisplay = data.emailEscola.replace(/^.*<(.+)>.*$/, '$1');
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
    <tr>
      <td bgcolor="#f5f5f5" style="background-color:#f5f5f5;border-radius:10px;padding:18px 20px;text-align:center;">
        <p style="margin:0 0 6px;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
          Fique atento: a fatura do ${data.nomeEscola} sempre chegar&#225; pelo remetente<br>
          <a href="mailto:${emailDisplay}"
            style="color:#222;font-weight:bold;text-decoration:none;">${emailDisplay}</a>
        </p>
        <p style="margin:0;font-size:12px;color:#777;line-height:1.6;font-family:Arial,sans-serif;">
          Nunca solicitamos dados banc&#225;rios ou senhas por e-mail.
          ${data.siteUrl ? `Acesse <a href="${data.siteUrl}" style="color:${COR};text-decoration:none;font-weight:bold;">${data.siteUrl.replace(/^https?:\/\/(www\.)?/, '')}</a> para confirmar a veracidade.` : ''}
        </p>
      </td>
    </tr>
  </table>`;
}

// ─── 9. Botão CTA principal ───────────────────────────────────────────────────

function botaoPrincipal(url: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
    <tr>
      <td>
        <!--[if mso]>
        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
          href="${url}" style="height:54px;v-text-anchor:middle;width:520px;" arcsize="8%"
          strokecolor="${COR}" fillcolor="${COR}">
          <w:anchorlock/>
          <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;letter-spacing:1.5px;">VEJA COMO ACESSAR SUA FATURA</center>
        </v:roundrect>
        <![endif]-->
        <!--[if !mso]><!-->
        <a href="${url}" target="_blank"
           style="display:block;background-color:${COR};color:#ffffff;font-size:14px;font-weight:bold;text-decoration:none;padding:18px 24px;border-radius:10px;font-family:Arial,sans-serif;text-align:center;letter-spacing:1.5px;mso-hide:all;">
          VEJA COMO ACESSAR SUA FATURA
        </a>
        <!--<![endif]-->
      </td>
    </tr>
  </table>`;
}

// ─── 10. Rodapé ───────────────────────────────────────────────────────────────

function redesSociais(data: EmailData): string {
  const redes: Array<{ icon: string; letra: string; fs: number; inset: number; nome: string; url: string }> = [];
  if (data.facebookUrl)  redes.push({ icon: ICO_FACEBOOK,  letra: 'f',  fs: 16, inset: 9,  nome: 'Facebook',  url: data.facebookUrl });
  if (data.instagramUrl) redes.push({ icon: ICO_INSTAGRAM, letra: 'ig', fs: 11, inset: 11, nome: 'Instagram', url: data.instagramUrl });
  if (data.youtubeUrl)   redes.push({ icon: ICO_YOUTUBE,   letra: 'yt', fs: 11, inset: 11, nome: 'YouTube',   url: data.youtubeUrl });
  if (data.linkedinUrl)  redes.push({ icon: ICO_LINKEDIN,  letra: 'in', fs: 14, inset: 11, nome: 'LinkedIn',  url: data.linkedinUrl });
  if (redes.length === 0) return '';

  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 8px;">
    <tr>
      ${redes.map(({ icon, letra, fs, inset, nome, url }) => `
      <td style="padding:0 8px;text-align:center;">
        <a href="${url}" target="_blank" style="text-decoration:none;display:inline-block;line-height:0;">
          <!--[if mso]><v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:40px;height:40px;" fillcolor="#ffffff" stroked="false"><v:textbox inset="0,${inset}px,0,0" style="mso-fit-shape-to-text:false;"><center><span style="font-family:Arial;font-size:${fs}px;font-weight:bold;color:${COR};">${letra}</span></center></v:textbox></v:oval><![endif]-->
          <!--[if !mso]><!--><img src="${icon}" width="40" height="40" alt="${nome}" style="display:block;border:0;border-radius:50%;"><!--<![endif]-->
        </a>
        <p style="margin:4px 0 0;font-size:9px;color:rgba(255,255,255,0.6);font-family:Arial,sans-serif;">${nome}</p>
      </td>`).join('')}
    </tr>
  </table>`;
}

function rodape(data: EmailData): string {
  const ano = new Date().getFullYear();
  const tel = (data.telefoneEscola ?? '').replace(/\D/g, '');
  const infos: string[] = [];
  if (data.cnpj)     infos.push(`CNPJ: ${data.cnpj}`);
  if (data.endereco) infos.push(data.endereco);

  const logoRodape = data.logoUrl
    ? `<table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 20px;">
         <tr>
           <td align="center" style="background:#ffffff;border-radius:10px;padding:8px 18px;line-height:0;">
             ${data.siteUrl ? `<a href="${data.siteUrl}" target="_blank" style="display:block;line-height:0;border:0;">` : ''}
             <img src="${data.logoUrl}" alt="${data.nomeEscola}" height="40"
               style="height:40px;width:auto;display:block;border:0;">
             ${data.siteUrl ? '</a>' : ''}
           </td>
         </tr>
       </table>`
    : `<p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${data.nomeEscola}</p>`;

  return `
  <tr>
    <td align="center" bgcolor="${COR}" style="background-color:${COR};padding:28px 40px 24px;">
      ${logoRodape}
      ${redesSociais(data)}
      <table cellpadding="0" cellspacing="0" border="0" style="margin:16px auto 0;">
        <tr><td style="height:1px;width:220px;background:rgba(255,255,255,0.3);font-size:0;line-height:0;">&nbsp;</td></tr>
      </table>
      <p style="margin:14px 0 4px;font-size:11px;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;line-height:1.7;">
        &#169; ${ano} ${data.nomeEscola} &#8226; Todos os direitos reservados
        ${data.siteUrl ? `&#8226; <a href="${data.siteUrl}" style="color:rgba(255,255,255,0.75);text-decoration:none;">${data.siteUrl.replace(/^https?:\/\/(www\.)?/, '')}</a>` : ''}
      </p>
      ${infos.length > 0 ? `<p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.65);font-family:Arial,sans-serif;">${infos.join(' &#8226; ')}</p>` : ''}
      ${data.telefoneEscola ? `<p style="margin:4px 0 0;font-size:10px;color:rgba(255,255,255,0.65);font-family:Arial,sans-serif;"><a href="tel:+55${tel}" style="color:rgba(255,255,255,0.75);text-decoration:none;">${data.telefoneEscola}</a></p>` : ''}
    </td>
  </tr>`;
}

// ─── Base ─────────────────────────────────────────────────────────────────────

function base(subject: string, introTitulo: string, descParagrafo: string, nota: string, data: EmailData): string {
  const portalUrl = data.linkPortalAluno ?? data.siteUrl ?? '#';

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <title>${subject}</title>
  <style>
    :root { color-scheme: light only; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f0f2f5 !important; }
    table { border-collapse: collapse; }
    /* Responsivo: empilha colunas abaixo de 480px */
    @media only screen and (max-width: 480px) {
      .wrapper  { width: 100% !important; }
      .body-pad { padding: 24px 20px 16px !important; }
      .col-cta  { display: block !important; width: 100% !important; padding-bottom: 12px !important; }
      .col-gap  { display: none !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;" bgcolor="#f0f2f5">
<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f0f2f5"
  style="background-color:#f0f2f5;padding:28px 8px;">
  <tr><td align="center">

    <table width="600" cellpadding="0" cellspacing="0" border="0" class="wrapper"
      style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- 1. Cabeçalho -->
      ${cabecalho(data)}

      <!-- 2–9. Corpo -->
      <tr>
        <td bgcolor="#ffffff" class="body-pad" style="background-color:#ffffff;padding:32px 40px 20px;">

          <!-- 2. Saudação -->
          <p style="margin:0 0 6px;font-size:16px;font-weight:bold;color:#222222;font-family:Arial,sans-serif;">${introTitulo}</p>
          <p style="margin:0 0 18px;font-size:17px;font-weight:bold;color:${COR};text-transform:uppercase;font-family:Arial,sans-serif;">${data.nomeResponsavel},</p>
          <p style="margin:0 0 4px;font-size:14px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">${descParagrafo}</p>

          <!-- 3. Card de resumo -->
          ${cartaoResumo(data)}

          <!-- 4. Intro de pagamento -->
          ${introsPagamento()}

          <!-- 5. PIX -->
          ${secaoPix(data)}

          <!-- 6. Boleto -->
          ${data.codigoBarras ? secaoBoleto(data.codigoBarras) : ''}

          <!-- 7. Dois CTAs lado a lado -->
          ${doisCtas(data)}

          <!-- 8. Aviso de segurança -->
          ${avisoSeguranca(data)}

          <!-- 9. Botão CTA principal -->
          ${botaoPrincipal(portalUrl)}

          <!-- Nota de rodapé do corpo -->
          ${nota}

        </td>
      </tr>

      <!-- 10. Rodapé vermelho -->
      ${rodape(data)}

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ─── Templates exportados ─────────────────────────────────────────────────────

export function templateLembrete(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Sua mensalidade vence em ${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}`;

  const desc = `Voc&#234; est&#225; recebendo o aviso de que o boleto do(a) aluno(a)
    <strong>${data.nomeAluno}</strong> vence em
    <strong style="color:${COR};">${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}</strong>,
    no dia <strong>${data.vencimento}</strong>.
    Efetue o pagamento em dia para evitar juros e multas.`;

  const nota = `<p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">
    * Se j&#225; realizou o pagamento, desconsidere este aviso.
    O sistema pode levar at&#233; 2 dias &#250;teis para processar a compensa&#231;&#227;o.
  </p>`;

  return { subject, html: base(subject, 'Sua mensalidade do IPESSP chegou.', desc, nota, data) };
}

export function templateVencimentoHoje(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Sua mensalidade vence HOJE`;

  const desc = `Voc&#234; est&#225; recebendo o aviso de que o boleto do(a) aluno(a)
    <strong>${data.nomeAluno}</strong>
    <strong style="color:${COR};">vence hoje, ${data.vencimento}</strong>.
    Efetue o pagamento at&#233; o final do dia para evitar juros e multas.`;

  const nota = `<p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">
    * Se j&#225; realizou o pagamento hoje, desconsidere este aviso.
  </p>`;

  return { subject, html: base(subject, 'Sua mensalidade do IPESSP vence hoje.', desc, nota, data) };
}

export function templateCobranca(data: EmailData): { subject: string; html: string } {
  const subject = `[${data.nomeEscola}] Mensalidade em atraso &#8212; ${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}`;

  const desc = `Identificamos que o boleto do(a) aluno(a) <strong>${data.nomeAluno}</strong>
    est&#225; em aberto h&#225;
    <strong style="color:${COR};">${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}</strong>
    ap&#243;s o vencimento em <strong>${data.vencimento}</strong>.
    Regularize sua situa&#231;&#227;o o quanto antes para evitar maiores encargos.`;

  const nota = `<p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">
    Caso tenha dificuldades para efetuar o pagamento, entre em contato conosco.
    Estamos &#224; disposi&#231;&#227;o para encontrar a melhor solu&#231;&#227;o.
  </p>`;

  return { subject, html: base(subject, 'Cobran&#231;a em aberto.', desc, nota, data) };
}
