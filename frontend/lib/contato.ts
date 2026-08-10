export const FONE_DISPLAY   = '(11) 99891-7111';
export const FONE_TEL       = 'tel:+5511998917111';
export const WHATSAPP_URL   = 'https://wa.me/5511998917111';
export const WHATSAPP_MSG   = 'https://wa.me/5511998917111?text=Ol%C3%A1!%20Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20os%20cursos%20do%20IPESSP.';
export const EMAIL_CONTATO  = 'marketing@ipessp.edu.br';
export const EMAIL_HREF     = 'mailto:marketing@ipessp.edu.br';
export const ENDERECO_RUA   = 'Rua Dona Antônia de Queirós, 333';
export const ENDERECO_BAIRRO = 'Consolação – São Paulo/SP';
export const ENDERECO_CEP   = 'CEP: 01307-012';
export const MAPS_URL       = 'https://maps.google.com/?q=Rua+Dona+Ant%C3%B4nia+de+Queir%C3%B3s%2C+333%2C+Consola%C3%A7%C3%A3o%2C+S%C3%A3o+Paulo';

/** F11/F12: valida scheme e avisa em dev quando a env var não está configurada. */
export function sophiaPortalUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SOPHIA_PORTAL_URL;
  if (!raw) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn('[IPESSP] NEXT_PUBLIC_SOPHIA_PORTAL_URL não configurada — links do Portal usarão "#"');
    }
    return '#';
  }
  const lower = raw.toLowerCase().trim();
  if (lower.startsWith('javascript:') || lower.startsWith('data:')) {
    // eslint-disable-next-line no-console
    console.error('[IPESSP] NEXT_PUBLIC_SOPHIA_PORTAL_URL com scheme inválido — ignorado');
    return '#';
  }
  return raw;
}
