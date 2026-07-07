'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WhatsAppFloat from '@/app/components/WhatsAppFloat';
import { Field, Input } from '@/app/portal-do-aluno/_lib/form';

export default function PortalLoginPage() {
  const router = useRouter();
  const [ra, setRa] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra, senha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.message ?? 'RA ou senha inválidos.');
        return;
      }
      router.push('/portal-do-aluno');
      router.refresh();
    } catch {
      setErro('Não foi possível conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--ink-900)' }}>Portal do Aluno</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-700)' }}>Entre com seu RA e senha.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="RA">
            <Input value={ra} onChange={e => setRa(e.target.value)} required autoFocus />
          </Field>
          <Field label="Senha">
            <Input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </Field>

          {erro && <p className="text-sm" style={{ color: 'var(--brand-600)' }}>{erro}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary justify-center mt-2">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="flex flex-col gap-2 mt-6 text-sm text-center">
          <Link href="/portal-do-aluno/esqueci-senha" className="hover:underline" style={{ color: 'var(--brand-600)' }}>
            Esqueci minha senha
          </Link>
          <Link href="/portal-do-aluno/primeiro-acesso" className="hover:underline" style={{ color: 'var(--brand-600)' }}>
            Primeiro acesso? Crie sua senha aqui
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
