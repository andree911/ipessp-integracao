const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ipessp_token');
}

export function setSession(token: string, tipo: string, nome: string) {
  localStorage.setItem('ipessp_token', token);
  localStorage.setItem('ipessp_tipo', tipo);
  localStorage.setItem('ipessp_nome', nome);
}

export function clearSession() {
  localStorage.removeItem('ipessp_token');
  localStorage.removeItem('ipessp_tipo');
  localStorage.removeItem('ipessp_nome');
}

export function getSession(): { token: string; tipo: string; nome: string } | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem('ipessp_token');
  const tipo  = localStorage.getItem('ipessp_tipo');
  const nome  = localStorage.getItem('ipessp_nome');
  if (!token || !tipo || !nome) return null;
  return { token, tipo, nome };
}

export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> =
    init.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' };
  Object.assign(headers, (init.headers as Record<string, string>) ?? {});
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(`${BASE}${path}`, { ...init, headers, credentials: 'include' });
}
