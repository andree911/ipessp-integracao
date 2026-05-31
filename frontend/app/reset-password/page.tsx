'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { apiFetch } from '../lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('A senha deve ter no mínimo 8 caracteres.'); return; }
    if (password !== confirm) { setError('As senhas não coincidem.'); return; }
    if (!token) { setError('Link de redefinição inválido.'); return; }

    setLoading(true);
    try {
      const res = await apiFetch('/v1/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, senha: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Link inválido ou expirado.');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/login-aluno'), 3000);
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6">
        <p className="text-sm mb-6" style={{ color: 'var(--ink-500)' }}>
          Link de redefinição inválido ou expirado.
        </p>
        <Link href="/forgot-password-aluno" className="btn btn-primary">
          Solicitar novo link
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center py-6">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: 'var(--brand-50)' }}
        >
          <svg width="32" height="32" fill="none" stroke="var(--brand-600)" strokeWidth="2.5" viewBox="0 0 24 24">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2
          className="font-bold mb-2"
          style={{ fontFamily: 'var(--font-sora)', fontSize: '1.375rem', color: 'var(--ink-900)' }}
        >
          Senha redefinida!
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ink-500)' }}>
          Redirecionando para o login...
        </p>
        <Link href="/login-aluno" className="btn btn-primary">
          Ir para o Login
        </Link>
      </div>
    );
  }

  return (
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
        Nova senha
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--ink-500)' }}>
        Escolha uma senha segura com no mínimo 8 caracteres.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <AuthInput
          label="Nova senha"
          id="password"
          showToggle
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Mín. 8 caracteres"
          autoComplete="new-password"
        />
        <AuthInput
          label="Confirmar nova senha"
          id="confirm"
          showToggle
          required
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        {error && (
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full justify-center py-3.5 mt-1"
        >
          {loading ? (
            <>
              <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              Salvando...
            </>
          ) : 'Salvar nova senha'}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout
      role="aluno"
      panelTitle="Sua segurança é nossa prioridade."
      panelSubtitle="Crie uma senha forte para manter sua conta protegida."
    >
      <Suspense fallback={<div style={{ color: 'var(--ink-500)' }} className="text-sm">Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  );
}
