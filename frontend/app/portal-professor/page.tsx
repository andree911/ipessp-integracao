'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, clearSession } from '../lib/api';

export default function PortalProfessorPage() {
  const router = useRouter();
  const session = typeof window !== 'undefined' ? getSession() : null;

  useEffect(() => {
    if (!session || session.tipo !== 'professor') {
      router.replace('/login-professor');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    clearSession();
    router.push('/login-professor');
  }

  if (!session) return null;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui)' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--line)',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--brand-600)' }}>
            IPESSP
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>Portal do Professor</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--ink-700)', fontWeight: 500 }}>
            {session.nome}
          </span>
          <button
            onClick={logout}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--ink-500)',
              background: 'none',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Boas-vindas */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)',
            padding: '2rem',
            marginBottom: '1.5rem',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <h1
            style={{
              fontFamily: 'var(--font-sora)',
              fontWeight: 700,
              fontSize: 'clamp(1.25rem, 2.5vw, 1.625rem)',
              color: 'var(--ink-900)',
              marginBottom: '0.5rem',
            }}
          >
            Olá, {session.nome.split(' ')[0]}!
          </h1>
          <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem' }}>
            Bem-vindo ao Portal do Professor do IPESSP.
          </p>
        </div>

        {/* Aviso em construção */}
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--line)',
            padding: '2.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <svg
            width="48"
            height="48"
            fill="none"
            stroke="var(--accent-500)"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            style={{ margin: '0 auto 1rem' }}
          >
            <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/>
          </svg>
          <h2
            style={{
              fontFamily: 'var(--font-sora)',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: 'var(--ink-900)',
              marginBottom: '0.5rem',
            }}
          >
            Funcionalidades em desenvolvimento
          </h2>
          <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
            O portal de professor está em construção. Em breve você poderá gerenciar turmas, lançar notas e compartilhar materiais.
          </p>
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--brand-600)',
              textDecoration: 'none',
              border: '1px solid var(--brand-200)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 1.25rem',
            }}
          >
            Voltar ao site
          </Link>
        </div>
      </main>
    </div>
  );
}
