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

// ─── 1. Cabeçalho: logo + contatos ───────────────────────────────────────────

function cabecalho(data: EmailData): string {
  const tel = (data.telefoneEscola ?? '').replace(/\D/g, '');

  const contatoLinha = (badge: string, texto: string, url: string): string => `
  <tr>
    <td width="52" align="center" valign="middle" style="padding:3px 0;">
      <span style="display:inline-block;background:#ffffff;padding:3px 7px;border-radius:4px;font-size:10px;font-weight:bold;color:${COR};font-family:Arial,sans-serif;white-space:nowrap;letter-spacing:0.5px;">${badge}</span>
    </td>
    <td valign="middle" style="padding:3px 0 3px 8px;">
      <a href="${url}" target="_blank" style="text-decoration:none;">
        <span style="font-size:12px;color:#ffffff;font-family:Arial,sans-serif;white-space:nowrap;">${texto}</span>
      </a>
    </td>
  </tr>`;

  const linhas: string[] = [];
  if (data.telefoneEscola) linhas.push(contatoLinha('TEL',    data.telefoneEscola, `tel:+55${tel}`));
  if (data.emailEscola)    linhas.push(contatoLinha('E-MAIL', data.emailEscola,    `mailto:${data.emailEscola}`));
  if (data.siteUrl)        linhas.push(contatoLinha('SITE',   data.siteUrl.replace(/^https?:\/\/(www\.)?/, ''), data.siteUrl));

  const logoHtml = data.logoUrl
    ? (data.siteUrl
        ? `<a href="${data.siteUrl}" target="_blank" style="text-decoration:none;border:0;display:inline-block;line-height:0;"><img src="${data.logoUrl}" alt="${data.nomeEscola}" height="48" border="0" style="height:48px;width:auto;display:block;border:0;outline:0;border-radius:10px;"></a>`
        : `<img src="${data.logoUrl}" alt="${data.nomeEscola}" height="48" border="0" style="height:48px;width:auto;display:block;border:0;outline:0;border-radius:10px;">`)
    : (data.siteUrl
        ? `<a href="${data.siteUrl}" target="_blank" style="text-decoration:none;"><span style="font-size:22px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${data.nomeEscola}</span></a>`
        : `<span style="font-size:22px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${data.nomeEscola}</span>`);

  return `
  <tr>
    <td align="center" bgcolor="${COR}" style="background-color:${COR};padding:20px 32px;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td valign="middle" class="hdr-logo">${logoHtml}</td>
          ${linhas.length > 0 ? `
          <td align="right" valign="top" class="hdr-info" style="padding-top:4px;">
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

  const lbl = (txt: string, mt = '0'): string =>
    `<span class="dm-t3" style="display:block;font-size:10px;color:#888;font-weight:bold;text-transform:uppercase;letter-spacing:0.8px;font-family:Arial,sans-serif;margin-top:${mt};margin-bottom:2px;">${txt}</span>`;

  const linhasMeta = temMeta ? `
    <tr>
      <td class="dm-bdr" style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td valign="top">
            ${data.codigoMatricula ? `
              ${lbl('C&#243;digo do Aluno / RA')}
              <span class="dm-t1" style="font-size:14px;color:#222;font-weight:bold;font-family:Arial,sans-serif;">${data.codigoMatricula}</span>
            ` : ''}
            ${data.curso ? `
              ${lbl('Curso', data.codigoMatricula ? '8px' : '0')}
              <span class="dm-t2" style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.curso}</span>
            ` : ''}
            ${data.competencia && !data.codigoMatricula && !data.curso ? `
              ${lbl('Compet&#234;ncia')}
              <span class="dm-t2" style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.competencia}</span>
            ` : ''}
          </td>
          ${data.competencia && (data.codigoMatricula || data.curso) ? `
          <td valign="top" align="center" style="padding:0 12px;">
            ${lbl('Refer&#234;ncia')}
            <span class="dm-t2" style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.competencia}</span>
          </td>` : ''}
          <td valign="top" align="right">
            ${lbl('Vencimento')}
            <span class="dm-t1" style="font-size:15px;color:#222;font-weight:bold;font-family:Arial,sans-serif;">${data.vencimento}</span>
          </td>
        </tr></table>
      </td>
    </tr>` : '';

  const linhaAluno = `
    <tr>
      <td class="dm-bdr" style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td>
            ${lbl('Aluno')}
            <span class="dm-t1" style="font-size:14px;color:#222;font-family:Arial,sans-serif;">${data.nomeAluno}</span>
          </td>
          ${!temMeta ? `
          <td align="right">
            ${lbl('Vencimento')}
            <span class="dm-t1" style="font-size:15px;color:#222;font-weight:bold;font-family:Arial,sans-serif;">${data.vencimento}</span>
          </td>` : ''}
        </tr></table>
      </td>
    </tr>`;

  const linhaDescricao = data.descricao ? `
    <tr>
      <td class="dm-bdr" style="padding:14px 20px;border-bottom:1px solid #e8e8e8;">
        ${lbl('Descri&#231;&#227;o')}
        <span class="dm-t2" style="font-size:13px;color:#444;font-family:Arial,sans-serif;">${data.descricao}</span>
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
        <table width="100%" cellpadding="0" cellspacing="0" border="0" class="dm-card"
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
  <p class="dm-t2" style="margin:0 0 4px;font-size:14px;color:#444;text-align:center;font-family:Arial,sans-serif;line-height:1.6;">
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
         style="display:block;margin:0 auto;border:0;border-radius:8px;background:#ffffff;">`
    : `<table width="130" cellpadding="0" cellspacing="0" border="0"
         style="height:130px;border-radius:8px;overflow:hidden;margin:0 auto;">
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
            <td width="150" valign="top" align="center" class="pix-qr" style="padding-right:16px;">
              ${qrBlock}
              <p style="margin:6px 0 0;font-size:9px;color:#ffb3be;font-family:Arial,sans-serif;">QR Code</p>
            </td>
            <td valign="top" class="pix-code">
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
      <td class="dm-bdr-a" style="border:1.5px solid #e0e0e0;padding:0;border-radius:12px;
                 mso-border-top-alt:solid #e0e0e0 1.5pt;mso-border-right-alt:solid #e0e0e0 1.5pt;
                 mso-border-bottom-alt:solid #e0e0e0 1.5pt;mso-border-left-alt:solid #e0e0e0 1.5pt;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:10px;overflow:hidden;">
          <tr>
            <td bgcolor="${COR}" style="background-color:${COR};padding:11px 16px;">
              <span style="font-size:11px;font-weight:bold;color:#ffffff;text-transform:uppercase;letter-spacing:0.5px;font-family:Arial,sans-serif;">${titulo}</span>
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" class="dm-inset" style="background-color:#ffffff;padding:14px 16px 16px;">
              <p class="dm-t2" style="margin:0 0 14px;font-size:13px;color:#444;line-height:1.5;font-family:Arial,sans-serif;">${texto}</p>
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
      <td bgcolor="#f5f5f5" class="dm-inset" style="background-color:#f5f5f5;border-radius:10px;padding:18px 20px;text-align:center;">
        <p class="dm-t2" style="margin:0 0 6px;font-size:13px;color:#555;line-height:1.7;font-family:Arial,sans-serif;">
          Fique atento: a fatura do ${data.nomeEscola} sempre chegar&#225; pelo remetente<br>
          <a href="mailto:${emailDisplay}"
            style="color:#222;font-weight:bold;text-decoration:none;">${emailDisplay}</a>
        </p>
        <p class="dm-t3" style="margin:0;font-size:12px;color:#777;line-height:1.6;font-family:Arial,sans-serif;">
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
  const redes: Array<{ cor: string; gradient?: string; vmlCor2?: string; letra: string; fs: number; inset: number; nome: string; url: string }> = [];
  if (data.facebookUrl)  redes.push({ cor: '#ffffff', letra: 'f',  fs: 18, inset: 9,  nome: 'Facebook',  url: data.facebookUrl });
  if (data.instagramUrl) redes.push({ cor: '#ffffff', letra: 'ig', fs: 11, inset: 11, nome: 'Instagram', url: data.instagramUrl });
  if (data.youtubeUrl)   redes.push({ cor: '#ffffff', letra: 'yt', fs: 11, inset: 11, nome: 'YouTube',   url: data.youtubeUrl });
  if (data.linkedinUrl)  redes.push({ cor: '#ffffff', letra: 'in', fs: 14, inset: 11, nome: 'LinkedIn',  url: data.linkedinUrl });
  if (redes.length === 0) return '';

  return `
  <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 8px;">
    <tr>
      ${redes.map(({ cor, gradient, vmlCor2, letra, fs, inset, nome, url }) => `
      <td style="padding:0 8px;text-align:center;">
        <a href="${url}" target="_blank" style="text-decoration:none;">
          <!--[if mso]><v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:40px;height:40px;" stroked="false"><v:fill type="${gradient ? 'gradient' : 'solid'}" color="${cor}"${gradient ? ` color2="${vmlCor2 ?? cor}" angle="135"` : ''}/><v:textbox inset="0,${inset}px,0,0" style="mso-fit-shape-to-text:false;"><center><span style="font-family:Arial;font-size:${fs}px;font-weight:bold;color:#000000;">${letra}</span></center></v:textbox></v:oval><![endif]-->
          <!--[if !mso]><!--><span style="display:inline-block;width:40px;height:40px;${gradient ? `background:${gradient}` : `background-color:${cor}`};border-radius:50%;text-align:center;line-height:40px;font-size:${fs}px;font-weight:bold;color:#000000;font-family:Arial,sans-serif;">${letra}</span><!--<![endif]-->
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
    ? `<div style="margin:0 auto 20px;text-align:center;line-height:0;">
         ${data.siteUrl
           ? `<a href="${data.siteUrl}" target="_blank" style="text-decoration:none;border:0;display:inline-block;line-height:0;"><img src="${data.logoUrl}" alt="${data.nomeEscola}" height="40" border="0" style="height:40px;width:auto;display:block;border:0;outline:0;border-radius:10px;"></a>`
           : `<img src="${data.logoUrl}" alt="${data.nomeEscola}" height="40" border="0" style="height:40px;width:auto;display:block;margin:0 auto;border:0;outline:0;border-radius:10px;">`}
       </div>`
    : (data.siteUrl
        ? `<a href="${data.siteUrl}" target="_blank" style="text-decoration:none;"><p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${data.nomeEscola}</p></a>`
        : `<p style="margin:0 0 16px;font-size:20px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${data.nomeEscola}</p>`);

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

function base(subject: string, introTitulo: string, descParagrafo: string, nota: string, data: EmailData, preheader = ''): string {
  const portalUrl = data.linkPortalAluno ?? data.siteUrl ?? '#';

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <title>${subject}</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f0f2f5 !important; }
    table { border-collapse: collapse; }
    /* ── Mobile: empilha colunas abaixo de 480px ──────────────────── */
    @media only screen and (max-width: 480px) {
      .wrapper  { width: 100% !important; }
      .body-pad { padding: 24px 16px 16px !important; }
      .col-cta  { display: block !important; width: 100% !important; padding-bottom: 12px !important; }
      .col-gap  { display: none !important; }
      /* PIX: QR acima, código abaixo */
      .pix-qr   { display: block !important; width: 100% !important; text-align: center !important; padding: 0 0 16px 0 !important; }
      .pix-code { display: block !important; width: 100% !important; }
      /* Header: logo à esquerda, contatos à direita */
      .hdr-logo { display: block !important; width: 100% !important; text-align: left !important; padding-bottom: 12px !important; }
      .hdr-info { display: block !important; width: 100% !important; text-align: right !important; }
    }
    /* ── Dark mode ─────────────────────────────────────────────────── */
    @media (prefers-color-scheme: dark) {
      .dm-bg    { background-color: #111827 !important; }
      .dm-card  { background-color: #1f2937 !important; }
      .dm-inset { background-color: #283447 !important; }
      .dm-bdr   { border-bottom-color: #374151 !important; }
      .dm-bdr-a { border-color: #374151 !important; }
      .dm-t1    { color: #f9fafb !important; }
      .dm-t2    { color: #d1d5db !important; }
      .dm-t3    { color: #9ca3af !important; }
      /* Logo box: mantém fundo branco mesmo no dark mode (é parte do design da marca) */
      .logo-box { background-color: #ffffff !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f0f2f5;" bgcolor="#f0f2f5">
${preheader ? `<div style="display:none;font-size:1px;color:#f0f2f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;</div>` : ''}
<table width="100%" cellpadding="0" cellspacing="0" border="0" class="dm-bg" bgcolor="#f0f2f5"
  style="background-color:#f0f2f5;padding:28px 8px;">
  <tr><td align="center">

    <table width="600" cellpadding="0" cellspacing="0" border="0" class="wrapper dm-card"
      style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- 1. Cabeçalho -->
      ${cabecalho(data)}

      <!-- 2–9. Corpo -->
      <tr>
        <td bgcolor="#ffffff" class="body-pad dm-card" style="background-color:#ffffff;padding:32px 40px 20px;">

          <!-- 2. Saudação -->
          <p class="dm-t1" style="margin:0 0 6px;font-size:16px;font-weight:bold;color:#222222;font-family:Arial,sans-serif;">${introTitulo}</p>
          <p style="margin:0 0 18px;font-size:17px;font-weight:bold;color:${COR};text-transform:uppercase;font-family:Arial,sans-serif;">${data.nomeResponsavel},</p>
          <p class="dm-t2" style="margin:0 0 4px;font-size:14px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">${descParagrafo}</p>

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
  const primeiroNome = data.nomeAluno.split(' ')[0];
  const subject = `[${data.nomeEscola}] Mensalidade de ${primeiroNome} — vence em ${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'} (${data.valor})`;
  const preheader = `Pague até ${data.vencimento} via PIX ou boleto e evite juros e multas.`;

  const desc = `Voc&#234; est&#225; recebendo o aviso de que o boleto do(a) aluno(a)
    <strong>${data.nomeAluno}</strong> vence em
    <strong style="color:${COR};">${data.diasRestantes} dia${data.diasRestantes === 1 ? '' : 's'}</strong>,
    no dia <strong>${data.vencimento}</strong>.
    Efetue o pagamento em dia para evitar juros e multas.`;

  const nota = `<p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">
    * Se j&#225; realizou o pagamento, desconsidere este aviso.
    O sistema pode levar at&#233; 2 dias &#250;teis para processar a compensa&#231;&#227;o.
  </p>`;

  return { subject, html: base(subject, 'Sua mensalidade do IPESSP chegou.', desc, nota, data, preheader) };
}

export function templateVencimentoHoje(data: EmailData): { subject: string; html: string } {
  const primeiroNome = data.nomeAluno.split(' ')[0];
  const subject = `[${data.nomeEscola}] Mensalidade de ${primeiroNome} — vence HOJE (${data.valor})`;
  const preheader = `Pague até o final de hoje, ${data.vencimento}, e evite juros. PIX e boleto disponíveis.`;

  const desc = `Voc&#234; est&#225; recebendo o aviso de que o boleto do(a) aluno(a)
    <strong>${data.nomeAluno}</strong>
    <strong style="color:${COR};">vence hoje, ${data.vencimento}</strong>.
    Efetue o pagamento at&#233; o final do dia para evitar juros e multas.`;

  const nota = `<p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">
    * Se j&#225; realizou o pagamento hoje, desconsidere este aviso.
  </p>`;

  return { subject, html: base(subject, 'Sua mensalidade do IPESSP vence hoje.', desc, nota, data, preheader) };
}

export function templateCobranca(data: EmailData): { subject: string; html: string } {
  const primeiroNome = data.nomeAluno.split(' ')[0];
  const subject = `[${data.nomeEscola}] Mensalidade de ${primeiroNome} em atraso — ${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'} (${data.valor})`;
  const preheader = `Venceu em ${data.vencimento}. Regularize agora para evitar maiores encargos. Estamos à disposição.`;

  const desc = `Identificamos que o boleto do(a) aluno(a) <strong>${data.nomeAluno}</strong>
    est&#225; em aberto h&#225;
    <strong style="color:${COR};">${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}</strong>
    ap&#243;s o vencimento em <strong>${data.vencimento}</strong>.
    Regularize sua situa&#231;&#227;o o quanto antes para evitar maiores encargos.`;

  const nota = `<p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">
    Caso tenha dificuldades para efetuar o pagamento, entre em contato conosco.
    Estamos &#224; disposi&#231;&#227;o para encontrar a melhor solu&#231;&#227;o.
  </p>`;

  return { subject, html: base(subject, 'Cobran&#231;a em aberto.', desc, nota, data, preheader) };
}
