import { NextRequest, NextResponse } from 'next/server';
import { ACCESS_COOKIE, REFRESH_COOKIE, cookieOptionsAccess, cookieOptionsRefresh } from '@/app/lib/portal-session';

const BACKEND = process.env.API_URL ?? 'http://localhost:3001';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendRes = await fetch(`${BACKEND}/portal/auth/primeiro-acesso`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok) {
    return NextResponse.json(data, { status: backendRes.status });
  }

  const res = NextResponse.json({ aluno: data.aluno });
  res.cookies.set(ACCESS_COOKIE, data.accessToken, cookieOptionsAccess);
  res.cookies.set(REFRESH_COOKIE, data.refreshToken, cookieOptionsRefresh);
  return res;
}
