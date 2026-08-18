export function escHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

/**
 * Envelope HTML padrão para notificações internas disparadas por formulários
 * públicos (candidaturas, contato, ouvidoria, solicitação de evento). `titulo`
 * é escapado antes de entrar no HTML -- ele frequentemente carrega dado
 * digitado pelo público (ex: assunto do contato), então nunca deve ser
 * interpolado cru no corpo do e-mail.
 */
export function renderInternalNotificationEmail(params: {
  nomeEscola: string;
  titulo: string;
  corpoHtml: string;
}): string {
  const { nomeEscola, titulo, corpoHtml } = params;
  return `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:24px;color:#333;">
      <h2 style="color:#C8102E;">${escHtml(titulo)}</h2>
      ${corpoHtml}
      <hr style="margin-top:24px;border:none;border-top:1px solid #eee;">
      <p style="font-size:11px;color:#999;">Enviado automaticamente pelo sistema ${escHtml(nomeEscola)}</p>
    </body></html>`;
}
