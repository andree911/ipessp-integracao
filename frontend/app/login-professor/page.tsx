'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { apiFetch, setSession } from '../lib/api';

export default function LoginProfessorPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Preencha e-mail e senha para continuar.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiFetch('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), senha: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'E-mail ou senha incorretos.');
        return;
      }
      if (data.tipo !== 'professor') {
        setError('Esta conta não é de professor. Use o login de aluno.');
        return;
      }
      setSession(data.token, data.tipo, data.nome);
      router.push('/portal-professor');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      role="professor"
      panelTitle="Gerencie suas turmas e conteúdos em um ambiente intuitivo."
      panelSubtitle="Acesse o lançamento de notas, materiais das aulas, frequência e comunicação com os alunos do IPESSP."
    >
      <div>
        <h1
          className="font-bold mb-1"
          style={{
            fontFamily: 'var(--font-sora, system-ui)',
            fontSize: 'clamp(1.5rem, 3vw, 1.875rem)',
            color: 'var(--ink-900)',
          }}
        >
          Acesso ao Portal
        </h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-500)' }}>
          Entre com suas credenciais de professor para continuar.
        </p>

        <div
          className="flex rounded-xl p-1 mb-7"
          style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
        >
          <Link
            href="/login-aluno"
            className="flex-1 text-center py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ color: 'var(--ink-500)' }}
          >
            Aluno
          </Link>
          <span
            className="flex-1 text-center py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--brand-600)', color: '#fff' }}
          >
            Professor
          </span>
        </div>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <AuthInput
            label="E-mail institucional"
            id="email"
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="professor@ipessp.edu.br"
            autoComplete="email"
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium"
                style={{ color: 'var(--ink-700)' }}
              >
                Senha
              </label>
              <Link
                href="/forgot-password-professor"
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--brand-600)' }}
              >
                Esqueceu a senha?
              </Link>
            </div>
            <AuthInput
              label=""
              id="password"
              showToggle
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

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
                Entrando...
              </>
            ) : 'Entrar no Portal'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--ink-500)' }}>
          Primeiro acesso?{' '}
          <Link
            href="/register-professor"
            className="font-semibold transition-colors"
            style={{ color: 'var(--brand-600)' }}
          >
            Criar conta
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
