import { NextRequest, NextResponse } from 'next/server';
import { portalFetch, ACCESS_COOKIE, REFRESH_COOKIE, cookieOptionsAccess, cookieOptionsRefresh } from '@/app/lib/portal-session';

export async function GET(req: NextRequest) {
  const matricula = req.nextUrl.searchParams.get('matricula');
  if (!matricula) return NextResponse.json({ message: 'Informe a matrícula' }, { status: 400 });

  const r = await portalFetch(`/portal/me/horario?matricula=${encodeURIComponent(matricula)}`);
  const res = NextResponse.json(r.data, { status: r.status });
  if (r.novosTokens) {
    res.cookies.set(ACCESS_COOKIE, r.novosTokens.accessToken, cookieOptionsAccess);
    res.cookies.set(REFRESH_COOKIE, r.novosTokens.refreshToken, cookieOptionsRefresh);
  }
  return res;
}
