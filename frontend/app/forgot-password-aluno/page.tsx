'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { apiFetch } from '../lib/api';

export default function ForgotPasswordAlunoPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!email.trim()) { setError('Informe o e-mail.'); return; }
    setError('');
    setLoading(true);
    try {
      await apiFetch('/v1/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
      });
      setSent(true);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role="aluno"
      panelTitle="Sua segurança é nossa prioridade."
      panelSubtitle="Processos de recuperação seguros para manter sua conta de aluno sempre protegida no IPESSP."
    >
      <div>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'var(--brand-50)' }}
        >
          <svg width="28" height="28" fill="none" stroke="var(--brand-600)" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        <h1
          className="font-bold mb-1"
          style={{ fontFamily: 'var(--font-sora, system-ui)', fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', color: 'var(--ink-900)' }}
        >
          Recuperar senha
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-500)' }}>
          {sent
            ? 'Verifique seu e-mail para continuar.'
            : 'Digite o e-mail da sua conta de aluno. Enviaremos um link para redefinição.'}
        </p>

        {sent ? (
          <div>
            <div
              className="rounded-2xl p-6 flex flex-col items-center text-center gap-3 mb-6"
              style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-200)' }}
            >
              <svg width="40" height="40" fill="none" stroke="var(--brand-600)" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'var(--brand-700)' }}>
                  E-mail enviado para <strong>{email}</strong>
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-500)' }}>
                  Não chegou? Verifique spam ou entre em contato com a secretaria IPESSP.
                </p>
              </div>
            </div>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="btn btn-outline w-full justify-center py-3"
            >
              Tentar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <AuthInput
              label="E-mail"
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="aluno@ipessp.edu.br"
              autoComplete="email"
            />

            {error && (
              <p className="text-xs" style={{ color: 'var(--brand-600)' }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Enviando...
                </>
              ) : 'Enviar link de recuperação'}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6" style={{ color: 'var(--ink-500)' }}>
          Lembrou da senha?{' '}
          <Link href="/login-aluno" className="font-semibold" style={{ color: 'var(--brand-600)' }}>
            Voltar para o login
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
