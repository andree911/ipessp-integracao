import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/app/lib/portal-session';

const BACKEND = process.env.API_URL ?? 'http://localhost:3001';

export async function POST() {
  const store = await cookies();
  const refreshToken = store.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    await fetch(`${BACKEND}/portal/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ACCESS_COOKIE, '', { maxAge: 0, path: '/' });
  res.cookies.set(REFRESH_COOKIE, '', { maxAge: 0, path: '/' });
  return res;
}
