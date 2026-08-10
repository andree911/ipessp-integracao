const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

if (typeof window !== 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
  // eslint-disable-next-line no-console
  console.error('[api] NEXT_PUBLIC_API_URL não definida — chamadas de API vão cair em http://localhost:3001. Verifique as env vars do deploy.');
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> =
    init.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' };
  Object.assign(headers, (init.headers as Record<string, string>) ?? {});
  return fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });
}
