'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WhatsAppFloat from '@/app/components/WhatsAppFloat';
import { Field, Input } from '@/app/portal-do-aluno/_lib/form';

export default function EsqueciSenhaPage() {
  const [ra, setRa] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/portal/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra }),
      });
    } finally {
      // Sempre mostra a mesma mensagem, exista ou não o RA — evita vazar quem está cadastrado.
      setEnviado(true);
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--ink-900)' }}>Esqueci minha senha</h1>

        {enviado ? (
          <p className="text-sm mt-6" style={{ color: 'var(--ink-700)' }}>
            Se o RA informado tiver uma conta e e-mail cadastrado, enviamos um link de redefinição de senha.
            Confira sua caixa de entrada (e o spam).
          </p>
        ) : (
          <>
            <p className="text-sm mb-8" style={{ color: 'var(--ink-700)' }}>
              Informe seu RA. Se houver e-mail cadastrado, enviaremos um link pra redefinir a senha.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Field label="RA">
                <Input value={ra} onChange={e => setRa(e.target.value)} required autoFocus />
              </Field>
              <button type="submit" disabled={loading} className="btn btn-primary justify-center mt-2">
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </button>
            </form>
          </>
        )}

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
