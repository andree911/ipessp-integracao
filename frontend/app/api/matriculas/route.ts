import { NextRequest, NextResponse } from 'next/server';

const BACKEND = process.env.API_URL ?? 'http://localhost:3001';

export async function POST(req: NextRequest) {
  const token = process.env.MATRICULAS_API_KEY;
  if (!token) {
    return NextResponse.json({ erro: 'Serviço indisponível' }, { status: 503 });
  }
  const body = await req.json();
  const res = await fetch(`${BACKEND}/v1/matriculas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
