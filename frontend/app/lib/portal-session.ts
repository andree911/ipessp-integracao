import { cookies } from 'next/headers';

const BACKEND = process.env.API_URL ?? 'http://localhost:3001';

export const ACCESS_COOKIE = 'portal_access';
export const REFRESH_COOKIE = 'portal_refresh';

const secure = process.env.NODE_ENV === 'production';

export const cookieOptionsAccess = {
  httpOnly: true,
  secure,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 15 * 60,
};

export const cookieOptionsRefresh = {
  httpOnly: true,
  secure,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 30 * 24 * 60 * 60,
};

async function backendFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${BACKEND}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

/**
 * Chama um endpoint autenticado do Portal do Aluno (GET /portal/me/*).
 * Se o access token expirou, tenta renovar 1x com o refresh token antes de
 * desistir. Devolve os tokens novos (se renovou) pra rota chamadora setar
 * os cookies na resposta.
 */
export async function portalFetch(path: string): Promise<{
  status: number;
  data: unknown;
  novosTokens?: { accessToken: string; refreshToken: string };
}> {
  const store = await cookies();
  const access = store.get(ACCESS_COOKIE)?.value;

  if (access) {
    const r = await backendFetch(path, { headers: { Authorization: `Bearer ${access}` } });
    if (r.status !== 401) return r;
  }

  const refresh = store.get(REFRESH_COOKIE)?.value;
  if (!refresh) return { status: 401, data: { message: 'Não autenticado' } };

  const refreshRes = await backendFetch('/portal/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: refresh }),
  });
  if (refreshRes.status !== 201 && refreshRes.status !== 200) {
    return { status: 401, data: { message: 'Sessão expirada' } };
  }

  const novosTokens = refreshRes.data as { accessToken: string; refreshToken: string };
  const retry = await backendFetch(path, { headers: { Authorization: `Bearer ${novosTokens.accessToken}` } });
  return { ...retry, novosTokens };
}
