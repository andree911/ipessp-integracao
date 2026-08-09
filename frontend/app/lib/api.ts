const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers: Record<string, string> =
    init.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' };
  Object.assign(headers, (init.headers as Record<string, string>) ?? {});
  return fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });
}
