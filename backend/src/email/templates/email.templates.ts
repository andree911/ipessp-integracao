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
  linkComoAcessar?: string;
}

const COR = '#7C2529';
// Cor de sobreposição escura equivalente a rgba(0,0,0,0.18) sobre #7C2529
// necessária porque Outlook não suporta rgba()
const COR_DARK = '#661E22';

// ─── 1. Cabeçalho: logo + contatos ───────────────────────────────────────────

function cabecalho(data: EmailData): string {
  const tel = (data.telefoneEscola ?? '').replace(/\D/g, '');

  const contatoLinha = (badge: string, texto: string, url: string): string => `
  <tr>
    <td width="52" align="center" valign="middle" style="width:52px;min-width:52px;padding:3px 0;">
      <span style="display:inline-block;background:#ffffff;width:46px;text-align:center;padding:3px 0;border-radius:4px;font-size:9px;font-weight:bold;color:${COR};font-family:Arial,sans-serif;white-space:nowrap;letter-spacing:0.5px;">${badge}</span>
    </td>
    <td valign="middle" style="padding:3px 0 3px 6px;text-align:left;">
      <a href="${url}" target="_blank" style="text-decoration:none;">
        <span style="font-size:11px;color:#ffffff;font-family:Arial,sans-serif;white-space:nowrap;">${texto}</span>
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
          <td valign="middle" class="hdr-logo" style="width:1%;">${logoHtml}</td>
          ${linhas.length > 0 ? `
          <td align="right" valign="middle" class="hdr-info" style="padding-left:20px;">
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
                    <p style="margin:0 0 6px;font-size:10px;color:#ffb3be;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Pix copia e cola <span style="font-weight:normal;letter-spacing:0;">(clique para selecionar)</span></p>
                    <p style="margin:0;font-size:12px;color:#ffffff;font-family:'Courier New',Courier,monospace;word-break:break-all;line-height:1.8;cursor:pointer;-webkit-user-select:all;-moz-user-select:all;user-select:all;">${data.codigoPix}</p>
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
              <p style="margin:0 0 6px;font-size:10px;color:#ffb3be;font-weight:bold;text-transform:uppercase;letter-spacing:1px;font-family:Arial,sans-serif;">Linha Digit&#225;vel <span style="font-weight:normal;letter-spacing:0;">(clique para selecionar)</span></p>
              <p style="margin:0;font-size:13px;color:#ffffff;font-family:'Courier New',Courier,monospace;word-break:break-all;line-height:1.9;cursor:pointer;-webkit-user-select:all;-moz-user-select:all;user-select:all;">${codigo}</p>
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
            style="color:${COR};font-weight:bold;text-decoration:none;">${emailDisplay}</a>
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
          <!--[if mso]><v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:40px;height:40px;" stroked="false"><v:fill type="solid" color="${COR}"/><v:textbox inset="0,${inset}px,0,0" style="mso-fit-shape-to-text:false;"><center><span style="font-family:Arial;font-size:${fs}px;font-weight:bold;color:#ffffff;">${letra}</span></center></v:textbox></v:oval><![endif]-->
          <!--[if !mso]><!--><span style="display:inline-block;width:40px;height:40px;${gradient ? `background:${gradient}` : `background-color:${cor}`};border-radius:50%;text-align:center;line-height:40px;font-size:${fs}px;font-weight:bold;color:${COR};font-family:Arial,sans-serif;">${letra}</span><!--<![endif]-->
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
  const comoAcessarUrl = data.linkComoAcessar ?? data.linkPortalAluno ?? '#';

  return `<!DOCTYPE html>
<html lang="pt-BR" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
  <title>${subject}</title>
  <style>
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
          ${botaoPrincipal(comoAcessarUrl)}

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

// ─── Email para o aluno: confirmação de matrícula + link de pagamento ────────

export interface ConfirmacaoMatriculaData {
  nomeAluno: string;
  curso: string;
  numeroParcelas: number;
  valorParcela: number;
  linkPagamento: string;
  nomeEscola: string;
  emailEscola?: string;
  telefoneEscola?: string;
  siteUrl?: string;
}

export function emailConfirmacaoMatricula(d: ConfirmacaoMatriculaData): string {
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const primeiroNome = d.nomeAluno.split(' ')[0];

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{margin:0;padding:0;background:#f0f2f5;font-family:Arial,sans-serif;}</style>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0f2f5;padding:28px 8px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" border="0"
      style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;">

      <!-- cabeçalho -->
      <tr>
        <td bgcolor="${COR}" style="background-color:${COR};padding:28px 32px;">
          <p style="margin:0;font-size:22px;font-weight:bold;color:#ffffff;">${d.nomeEscola}</p>
          <p style="margin:4px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">Confirmação de Matrícula</p>
        </td>
      </tr>

      <!-- corpo -->
      <tr>
        <td style="padding:32px 40px;">
          <p style="margin:0 0 8px;font-size:16px;font-weight:bold;color:#222;">Olá, ${primeiroNome}! 🎓</p>
          <p style="margin:0 0 20px;font-size:14px;color:#444;line-height:1.7;">
            Sua matrícula no curso de <strong>${d.curso}</strong> foi registrada com sucesso.
            Para concluir o processo, realize o pagamento da <strong>1ª parcela</strong> pelo link abaixo:
          </p>

          <!-- card de pagamento -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr>
              <td bgcolor="${COR}" style="background-color:${COR};padding:2px;border-radius:12px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff"
                  style="background:#ffffff;border-radius:10px;overflow:hidden;">
                  <tr>
                    <td style="padding:18px 20px;border-bottom:1px solid #e8e8e8;">
                      <span style="font-size:11px;font-weight:bold;text-transform:uppercase;color:#888;letter-spacing:0.8px;">Curso</span><br>
                      <span style="font-size:14px;color:#222;font-weight:bold;">${d.curso}</span>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:18px 20px;border-bottom:1px solid #e8e8e8;">
                      <span style="font-size:11px;font-weight:bold;text-transform:uppercase;color:#888;letter-spacing:0.8px;">Plano</span><br>
                      <span style="font-size:14px;color:#222;">${d.numeroParcelas}x de ${fmt(d.valorParcela)}</span>
                    </td>
                  </tr>
                  <tr>
                    <td bgcolor="${COR}" style="background-color:${COR};padding:16px 20px;">
                      <span style="font-size:13px;color:#ffffff;font-weight:bold;">1ª Parcela</span>
                      <span style="font-size:24px;font-weight:bold;color:#ffffff;float:right;">${fmt(d.valorParcela)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- botão de pagamento -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
            <tr>
              <td align="center">
                <a href="${d.linkPagamento}" target="_blank"
                  style="display:inline-block;background-color:${COR};color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;padding:16px 40px;border-radius:10px;letter-spacing:0.5px;">
                  PAGAR AGORA
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0 0 6px;font-size:13px;color:#555;line-height:1.7;">
            Você pode pagar com <strong>cartão de crédito, PIX ou boleto</strong> pelo Mercado Pago.
            O link é seguro e expira em 30 dias.
          </p>

          ${d.emailEscola || d.telefoneEscola ? `
          <p style="margin:20px 0 0;font-size:13px;color:#555;line-height:1.7;">
            Dúvidas? Entre em contato conosco:
            ${d.telefoneEscola ? `<br><strong>${d.telefoneEscola}</strong>` : ''}
            ${d.emailEscola ? `<br><a href="mailto:${d.emailEscola}" style="color:${COR};">${d.emailEscola}</a>` : ''}
          </p>` : ''}
        </td>
      </tr>

      <!-- rodapé -->
      <tr>
        <td bgcolor="${COR}" style="background-color:${COR};padding:16px 32px;">
          <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.7);">
            ${d.nomeEscola}${d.siteUrl ? ` · <a href="${d.siteUrl}" style="color:rgba(255,255,255,0.7);">${d.siteUrl.replace(/^https?:\/\/(www\.)?/, '')}</a>` : ''}
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

// ─── Templates exportados ─────────────────────────────────────────────────────

const SUBJECTS_LEMBRETE: Record<number, string> = {
  7: 'IPESSP - Sua Mensalidade Vence em 7 Dias',
  5: 'IPESSP - Lembrete de Vencimento',
  3: 'IPESSP - Sua Parcela Vence em Breve',
  1: 'IPESSP - Sua Mensalidade Vence Amanhã',
};

export function templateLembrete(data: EmailData): { subject: string; html: string } {
  const subject = SUBJECTS_LEMBRETE[data.diasRestantes ?? 0]
    ?? `IPESSP - Sua Mensalidade Vence em ${data.diasRestantes} Dias`;
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
  const subject = 'IPESSP - Vencimento da sua parcela';
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

const SUBJECTS_COBRANCA: Record<number, string> = {
  1:  'IPESSP - Parcela em Aberto',
  2:  'IPESSP - Lembrete importante sobre sua mensalidade',
  3:  'IPESSP - Regularização pendente - 3 dias de atraso',
  7:  'IPESSP - Aviso de Mensalidade em Atraso',
  8:  'IPESSP - Boleto em atraso',
  9:  'IPESSP - Parcela em Atraso',
  10: 'IPESSP - Aviso de pendência financeira - 10 dias em atraso',
  12: 'IPESSP - PARCELA EM ATRASO',
  15: 'IPESSP - AVISO DE INADIMPLÊNCIA',
  20: 'IPESSP - PARCELA COM 20 DIAS EM ATRASO',
  25: 'IPESSP - MENSALIDADE EM ATRASO',
  30: 'Regularização Urgente – Débito em Aberto há 30 dias',
};

export function templateCobranca(data: EmailData): { subject: string; html: string } {
  const subject = SUBJECTS_COBRANCA[data.diasAtraso ?? 0]
    ?? `IPESSP - Mensalidade em atraso — ${data.diasAtraso} dia${data.diasAtraso === 1 ? '' : 's'}`;
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

// ─── Email interno: relatório de nova matrícula para o financeiro ─────────────

export interface RelatorioMatriculaData {
  nomeAluno: string;
  cpfAluno: string;
  emailAluno?: string;
  telefoneAluno?: string;
  nomeResponsavel?: string;
  cpfResponsavel?: string;
  emailResponsavel?: string;
  telefoneResponsavel?: string;
  curso: string;
  unidade: string;
  turno: string;
  periodoLetivo: string;
  numeroParcelas: number;
  valorParcela: number;
  dataPrimeiraParcela: string;
  desconto?: string;
  codigoAluno: number;
  dataMatricula: string;
  nomeEscola: string;
}

export function emailRelatorioMatricula(d: RelatorioMatriculaData): string {
  const fmt = (v: number) =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const linha = (label: string, valor: string) =>
    valor
      ? `<tr>
          <td style="padding:6px 12px;font-size:13px;color:#555;font-family:Arial,sans-serif;white-space:nowrap;font-weight:bold;">${label}</td>
          <td style="padding:6px 12px;font-size:13px;color:#222;font-family:Arial,sans-serif;">${valor}</td>
        </tr>`
      : '';

  const secao = (titulo: string, linhas: string) =>
    `<tr>
      <td colspan="2" style="padding:14px 12px 4px;font-size:11px;font-weight:bold;text-transform:uppercase;
        letter-spacing:0.8px;color:${COR};font-family:Arial,sans-serif;border-top:1px solid #e0e0e0;">
        ${titulo}
      </td>
    </tr>
    ${linhas}`;

  const totalPlano = fmt(d.numeroParcelas * d.valorParcela);

  const blocoResponsavel = d.nomeResponsavel
    ? secao('Responsável Financeiro',
        linha('Nome', d.nomeResponsavel) +
        linha('CPF', d.cpfResponsavel ?? '') +
        linha('E-mail', d.emailResponsavel ?? '') +
        linha('Telefone', d.telefoneResponsavel ?? ''))
    : '';

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f4;">
  <tr><td align="center" style="padding:32px 16px;">
    <table width="600" cellpadding="0" cellspacing="0" border="0"
      style="max-width:600px;width:100%;background:#ffffff;border-radius:8px;overflow:hidden;
             box-shadow:0 2px 8px rgba(0,0,0,0.08);">

      <!-- cabeçalho -->
      <tr>
        <td colspan="2" bgcolor="${COR}" style="background-color:${COR};padding:24px 32px;">
          <span style="font-size:20px;font-weight:bold;color:#fff;font-family:Arial,sans-serif;">
            ${d.nomeEscola}
          </span><br>
          <span style="font-size:13px;color:rgba(255,255,255,0.85);font-family:Arial,sans-serif;">
            Notificação interna — Nova Matrícula
          </span>
        </td>
      </tr>

      <!-- destaque -->
      <tr>
        <td colspan="2" style="padding:20px 32px 8px;">
          <p style="margin:0;font-size:15px;color:#222;font-family:Arial,sans-serif;line-height:1.6;">
            Uma nova matrícula foi registrada em <strong>${d.dataMatricula}</strong>.
            Verifique os dados abaixo e providencie o <strong>plano de pagamento</strong>,
            a <strong>geração do boleto</strong> e a <strong>nota fiscal</strong> no Sophia.
          </p>
        </td>
      </tr>

      <!-- tabela de dados -->
      <tr>
        <td colspan="2" style="padding:8px 20px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">

            ${secao('Dados do Aluno',
              linha('Nome', d.nomeAluno) +
              linha('CPF', d.cpfAluno) +
              linha('E-mail', d.emailAluno ?? '') +
              linha('Telefone', d.telefoneAluno ?? '') +
              linha('Código Sophia', String(d.codigoAluno)))}

            ${blocoResponsavel}

            ${secao('Curso / Matrícula',
              linha('Curso', d.curso) +
              linha('Unidade', d.unidade) +
              linha('Turno', d.turno) +
              linha('Período Letivo', d.periodoLetivo))}

            ${secao('Plano de Pagamento',
              linha('Nº de Parcelas', String(d.numeroParcelas)) +
              linha('Valor por Parcela', fmt(d.valorParcela)) +
              linha('1ª Parcela', d.dataPrimeiraParcela) +
              linha('Desconto', d.desconto ?? '—') +
              linha('Total do Plano', totalPlano))}

          </table>
        </td>
      </tr>

      <!-- checklist financeiro -->
      <tr>
        <td colspan="2" style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background:#fff8e1;border-left:4px solid #f0a500;border-radius:4px;padding:16px;">
            <tr>
              <td style="padding:14px 16px;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:#7a5200;font-family:Arial,sans-serif;">
                  Ações necessárias no Sophia:
                </p>
                <ul style="margin:0;padding-left:18px;font-size:13px;color:#5a3d00;font-family:Arial,sans-serif;line-height:1.9;">
                  <li>Registrar plano de pagamento (${d.numeroParcelas}x de ${fmt(d.valorParcela)})</li>
                  <li>Gerar boleto(s) no Sophia</li>
                  <li>Emitir nota fiscal</li>
                  ${d.nomeResponsavel ? `<li>Confirmar vínculo do responsável financeiro: ${d.nomeResponsavel}</li>` : ''}
                </ul>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- rodapé -->
      <tr>
        <td colspan="2" bgcolor="${COR}" style="background-color:${COR};padding:14px 32px;">
          <span style="font-size:11px;color:rgba(255,255,255,0.7);font-family:Arial,sans-serif;">
            Email automático gerado pelo sistema de integração — não responder.
          </span>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
