'use client';

import { type ReactNode } from 'react';
import Link from 'next/link';

type Role = 'aluno' | 'professor';

interface AuthLayoutProps {
  role: Role;
  panelTitle: string;
  panelSubtitle: string;
  children: ReactNode;
}

const roleConfig = {
  aluno: {
    badge: 'Portal do Aluno',
    switchLabel: 'Sou Professor',
    switchHref: '#',
    badgeIcon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"/>
      </svg>
    ),
    stats: [
      { value: '5.000+', label: 'Especialistas formados' },
      { value: '54', label: 'Cursos disponíveis' },
      { value: '25', label: 'Anos de excelência' },
    ],
    gradient: 'linear-gradient(145deg, var(--brand-700) 0%, var(--brand-900) 100%)',
  },
  professor: {
    badge: 'Portal do Professor',
    switchLabel: 'Sou Aluno',
    switchHref: '#',
    badgeIcon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    stats: [
      { value: '100+', label: 'Docentes ativos' },
      { value: '54', label: 'Cursos oferecidos' },
      { value: '25', label: 'Anos de história' },
    ],
    gradient: 'linear-gradient(145deg, #3d0b0b 0%, #1a0505 100%)',
  },
} as const;

export default function AuthLayout({ role, panelTitle, panelSubtitle, children }: AuthLayoutProps) {
  const cfg = roleConfig[role];

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}
    >
      {/* Card principal */}
      <div
        className="bg-white flex flex-col md:flex-row w-full overflow-hidden"
        style={{
          maxWidth: '960px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* ── Painel esquerdo – Formulário ───────────────── */}
        <div className="w-full md:w-[52%] flex flex-col p-8 sm:p-10 lg:p-12">
          {/* Header do painel */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex-shrink-0">
              <img
                src="/images/logo.png"
                alt="Faculdade IPESSP"
                style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
              />
            </Link>
            {/* Badge de role */}
            <span
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}
            >
              {cfg.badgeIcon}
              {cfg.badge}
            </span>
          </div>

          {/* Conteúdo do formulário */}
          <div className="flex-1 flex flex-col justify-center">
            {children}
          </div>

          {/* Voltar ao site */}
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--line)' }}>
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm transition-colors"
              style={{ color: 'var(--ink-500)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--brand-600)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--ink-500)'; }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6"/>
              </svg>
              Voltar ao site da Faculdade IPESSP
            </Link>
          </div>
        </div>

        {/* ── Painel direito – Branding ───────────────────── */}
        <div
          className="hidden md:flex md:w-[48%] flex-col justify-between relative overflow-hidden p-10"
          style={{ background: cfg.gradient }}
        >
          {/* Decorações de fundo */}
          <div
            className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'white', filter: 'blur(40px)' }}
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -left-16 w-80 h-80 rounded-full opacity-10"
            style={{ background: 'white', filter: 'blur(50px)' }}
            aria-hidden
          />
          {/* Padrão de pontos decorativo */}
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden
          />

          {/* Texto */}
          <div className="relative z-10">
            {/* Role label */}
            <span
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-8"
              style={{ background: 'var(--accent-400)', color: 'var(--ink-900)' }}
            >
              {cfg.badgeIcon}
              {cfg.badge}
            </span>

            <h2
              className="font-bold text-white mb-4 leading-tight"
              style={{
                fontFamily: 'var(--font-sora, system-ui)',
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                lineHeight: '1.15',
              }}
            >
              {panelTitle}
            </h2>
            <p
              className="leading-relaxed mb-8"
              style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9375rem' }}
            >
              {panelSubtitle}
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {cfg.stats.map(s => (
                <div
                  key={s.label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(4px)' }}
                >
                  <p
                    className="font-bold text-white"
                    style={{ fontFamily: 'var(--font-sora)', fontSize: '1.25rem', lineHeight: 1 }}
                  >
                    {s.value}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Logo card inferior */}
          <div className="relative z-10 mt-8">
            <Link href="/" className="group inline-flex items-center gap-4 rounded-2xl px-5 py-4 transition-all duration-300"
              style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.35)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.2)'; }}
            >
              <div
                className="flex items-center justify-center rounded-xl p-2 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'white', width: '56px', height: '56px' }}
              >
                <img src="/images/logo.png" alt="IPESSP" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <div className="text-white">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Faculdade</p>
                <p className="font-bold text-xl leading-tight" style={{ fontFamily: 'var(--font-sora)' }}>
                  IPESSP
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
