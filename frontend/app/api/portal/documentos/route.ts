import { NextRequest, NextResponse } from 'next/server';
import { portalFetch, ACCESS_COOKIE, REFRESH_COOKIE, cookieOptionsAccess, cookieOptionsRefresh } from '@/app/lib/portal-session';

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const r = await portalFetch('/portal/me/documentos', { method: 'POST', body: formData });
  const res = NextResponse.json(r.data, { status: r.status });
  if (r.novosTokens) {
    res.cookies.set(ACCESS_COOKIE, r.novosTokens.accessToken, cookieOptionsAccess);
    res.cookies.set(REFRESH_COOKIE, r.novosTokens.refreshToken, cookieOptionsRefresh);
  }
  return res;
}
