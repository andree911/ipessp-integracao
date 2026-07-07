'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WhatsAppFloat from '@/app/components/WhatsAppFloat';
import { Field, Input } from '@/app/portal-do-aluno/_lib/form';

function RedefinirSenhaForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  if (!token) {
    return (
      <p className="text-sm" style={{ color: 'var(--brand-600)' }}>
        Link inválido. Solicite um novo link em &quot;Esqueci minha senha&quot;.
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmar) {
      setErro('As senhas não conferem.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.message ?? 'Link inválido ou expirado.');
        return;
      }
      setSucesso(true);
      setTimeout(() => router.push('/portal-do-aluno/login'), 2000);
    } catch {
      setErro('Não foi possível conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  if (sucesso) {
    return (
      <p className="text-sm" style={{ color: 'var(--ink-700)' }}>
        Senha redefinida! Redirecionando pro login...
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field label="Nova senha (mínimo 6 caracteres)">
        <Input type="password" value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required autoFocus />
      </Field>
      <Field label="Confirmar nova senha">
        <Input type="password" value={confirmar} onChange={e => setConfirmar(e.target.value)} required />
      </Field>
      {erro && <p className="text-sm" style={{ color: 'var(--brand-600)' }}>{erro}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary justify-center mt-2">
        {loading ? 'Salvando...' : 'Redefinir senha'}
      </button>
    </form>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-8" style={{ color: 'var(--ink-900)' }}>Redefinir senha</h1>
        <Suspense fallback={null}>
          <RedefinirSenhaForm />
        </Suspense>
        <div className="mt-6 text-sm text-center">
          <Link href="/portal-do-aluno/login" className="hover:underline" style={{ color: 'var(--brand-600)' }}>
            Voltar pro login
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
