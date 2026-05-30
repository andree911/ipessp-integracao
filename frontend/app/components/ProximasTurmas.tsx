'use client';

import { useRef } from 'react';

/* Próximas turmas — conteúdo baseado nos cursos reais do IPESSP */
const events = [
  {
    id: 1,
    category: 'Pós-Graduação · Estética',
    title: 'Harmonização Orofacial (HOF) – Especialização Clínica',
    date: '14 jun. 2026',
    local: 'IPESSP – Consolação, São Paulo/SP',
    image: '/images/banner-2.jpg',
    color: '#9b1c1c',
    href: '#pre-inscricao',
  },
  {
    id: 2,
    category: 'Pós-Graduação · Cardiologia',
    title: 'Circulação Extracorpórea – Perfusão (Nova Turma)',
    date: '21 jun. 2026',
    local: 'IPESSP – Consolação, São Paulo/SP',
    image: '/images/banner-3.jpeg',
    color: '#7d1717',
    href: '#pre-inscricao',
  },
  {
    id: 3,
    category: 'Online ao Vivo',
    title: 'Farmácia Oncológica – c/ Estágio na FMUSP/ICESP',
    date: '28 jun. 2026',
    local: 'Online ao Vivo + Estágio USP',
    image: '/images/banner-4.jpg',
    color: '#b81f1f',
    href: '#pre-inscricao',
  },
  {
    id: 4,
    category: 'Pós-Graduação · Diagnóstico',
    title: 'Hematologia e Hemoterapia Laboratorial',
    date: '05 jul. 2026',
    local: 'IPESSP – Consolação, São Paulo/SP',
    image: '/images/banner-5.jpg',
    color: '#9b1c1c',
    href: '#pre-inscricao',
  },
  {
    id: 5,
    category: 'EAD · 40% a distância',
    title: 'Biomedicina Estética Avançada – EAD',
    date: '12 jul. 2026',
    local: 'Presencial + EAD',
    image: '/images/banner-6.jpg',
    color: '#5c1111',
    href: '#pre-inscricao',
  },
  {
    id: 6,
    category: 'Pós-Graduação · Gestão',
    title: 'Administração Hospitalar e Serviços de Saúde – Online',
    date: '19 jul. 2026',
    local: 'Online ao Vivo',
    image: '/images/banner-1.jpeg',
    color: '#7d1717',
    href: '#pre-inscricao',
  },
];

export default function ProximasTurmas() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 320 : -320, behavior: 'smooth' });
  };

  return (
    <section className="section-gap" style={{ background: 'var(--surface)' }}>
      <div className="container-site">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--brand-500)' }}>
              Agenda 2026
            </p>
            <h2 className="font-bold"
              style={{
                fontFamily: 'var(--font-sora, var(--font-display))',
                fontSize: 'var(--fs-h1)',
                color: 'var(--ink-900)',
              }}>
              Próximas Turmas
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors"
              style={{ borderColor: 'var(--line)', color: 'var(--ink-500)' }}
              aria-label="Rolar esquerda">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{ borderColor: 'var(--brand-600)', color: 'var(--brand-600)', background: 'var(--brand-50)', border: '1px solid var(--brand-600)' }}
              aria-label="Rolar direita">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
            <a href="#pre-inscricao" className="btn btn-outline text-sm py-2 px-4 hidden sm:inline-flex">
              Ver Todos os Cursos
            </a>
          </div>
        </div>

        {/* Cards scroll */}
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {events.map(ev => (
            <div
              key={ev.id}
              className="flex-shrink-0 w-72 snap-start"
              style={{
                borderRadius: 'var(--radius-lg)',
                background: 'var(--surface)',
                border: '1px solid var(--line)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
              }}
            >
              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img src={ev.image} alt={ev.title} className="w-full h-full object-cover" />
                <span
                  className="absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full text-white"
                  style={{ background: ev.color }}>
                  {ev.category}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-3">
                <h3 className="font-semibold leading-snug"
                  style={{ color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', lineHeight: '1.4' }}>
                  {ev.title}
                </h3>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2" style={{ color: 'var(--ink-500)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span className="text-xs">{ev.date}</span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: 'var(--ink-500)' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-xs">{ev.local}</span>
                  </div>
                </div>

                <a href={ev.href}
                  className="btn btn-primary text-sm py-2.5 text-center w-full mt-1"
                  style={{ justifyContent: 'center' }}>
                  Inscreva-se
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <a href="#pre-inscricao" className="btn btn-outline text-sm">Ver Todos os Cursos</a>
        </div>
      </div>
    </section>
  );
}
