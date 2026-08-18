const COR_MARCA = '#7C2529';

const PASSOS: [string, string, string][] = [
  [
    '01',
    'Acesse o Portal do Aluno',
    'Clique no botão ao final desta página ou acesse diretamente o Portal do Aluno Sophia no seu navegador.',
  ],
  [
    '02',
    'Faça o login',
    'Preencha com o usuário e a senha informados no e-mail enviado. Caso não encontre o e-mail, verifique a caixa de spam ou entre em contato com a secretaria.',
  ],
  [
    '03',
    'Clique na aba "Financeiro"',
    'No menu superior, clique em Financeiro e depois em "Visualizar ficha financeira". A lista já vem filtrada por "Em aberto".',
  ],
  [
    '04',
    'Localize a parcela',
    'Confira o valor e a data de vencimento na tabela. Se necessário, clique em "Buscar" para atualizar a listagem.',
  ],
  [
    '05',
    'Escolha a forma de pagamento',
    'Na linha da parcela, você verá três opções: Boleto (baixar o PDF), Linha Digitável (copiar o código de barras) ou Pix copia e cola (pagar via PIX instantaneamente).',
  ],
  [
    '06',
    'Realize o pagamento',
    'Pague pelo aplicativo do seu banco usando o código de barras ou o código PIX. O pagamento via PIX é processado em segundos, 24 horas por dia.',
  ],
];

function renderPasso([num, titulo, desc]: [string, string, string]): string {
  return `
      <div style="display:flex;gap:20px;align-items:flex-start;background:#f8f8f8;border:1px solid #e8e8e8;border-radius:12px;padding:24px;margin-bottom:16px;">
        <div style="flex-shrink:0;width:48px;height:48px;border-radius:50%;background:${COR_MARCA};display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#fff;letter-spacing:0.04em;">
          ${num}
        </div>
        <div>
          <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:16px;font-weight:700;color:#111;">${titulo}</p>
          <p style="margin:0;font-family:Arial,sans-serif;font-size:14px;color:#555;line-height:1.7;">${desc}</p>
        </div>
      </div>`;
}

/** Página estática de instruções de pagamento, linkada nos e-mails/WhatsApp de cobrança. */
export function renderComoPagarPage(portalUrl: string): string {
  const passosHtml = PASSOS.map(renderPasso).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Como pagar sua mensalidade — IPESSP</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#f0f2f5;font-family:Arial,sans-serif;color:#222}
    a{color:inherit;text-decoration:none}
    @media(max-width:600px){
      .card{padding:24px 16px !important}
      .btn{display:block !important;text-align:center !important}
    }
  </style>
</head>
<body style="padding:32px 16px;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- Logo / Header -->
        <tr>
          <td style="background:${COR_MARCA};border-radius:16px 16px 0 0;padding:28px 40px;" class="card">
            <p style="font-family:Arial,sans-serif;font-size:11px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Portal Financeiro</p>
            <h1 style="font-family:Arial,sans-serif;font-size:24px;font-weight:700;color:#fff;line-height:1.3;margin-bottom:8px;">Como pagar sua mensalidade</h1>
            <p style="font-family:Arial,sans-serif;font-size:14px;color:rgba(255,255,255,0.75);line-height:1.6;">Siga os passos abaixo para acessar e pagar sua fatura pelo Portal do Aluno Sophia.</p>
          </td>
        </tr>

        <!-- Passos -->
        <tr>
          <td style="background:#fff;padding:32px 40px;" class="card">
            ${passosHtml}

            <!-- Dica -->
            <div style="background:#fdf5f5;border:1px solid #f5d5d5;border-radius:10px;padding:20px 24px;margin:8px 0 28px;">
              <p style="font-family:Arial,sans-serif;font-size:13px;color:${COR_MARCA};line-height:1.7;">
                <strong>Dica:</strong> o pagamento via PIX é compensado na hora. Se você pagar por boleto bancário, o sistema pode levar até 2 dias úteis para registrar a quitação — o comprovante é suficiente em caso de verificação.
              </p>
            </div>

            <!-- Botão -->
            <a href="${portalUrl}" target="_blank" class="btn"
               style="display:block;background:${COR_MARCA};color:#fff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;text-align:center;padding:18px 24px;border-radius:10px;letter-spacing:1px;">
              ACESSAR O PORTAL DO ALUNO SOPHIA
            </a>

            <p style="margin-top:16px;font-family:Arial,sans-serif;font-size:12px;color:#999;text-align:center;line-height:1.6;">
              Problemas com acesso? Entre em contato com o financeiro pelo WhatsApp.
            </p>
          </td>
        </tr>

        <!-- Rodapé -->
        <tr>
          <td style="background:#f8f8f8;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e8e8e8;">
            <p style="font-family:Arial,sans-serif;font-size:12px;color:#aaa;">
              IPESSP — Instituto de Pesquisa e Educação em Saúde de São Paulo
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
