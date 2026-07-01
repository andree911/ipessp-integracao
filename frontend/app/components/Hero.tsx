'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';

/* Slides baseados nos banners reais do site IPESSP */
const slides = [
  {
    id: 1,
    image: '/images/banner-1.jpeg',
    badge: 'Vestibular 2026',
    title: 'Vestibular 2026 com Inscrições Abertas',
    subtitle: 'Garanta sua vaga na faculdade de saúde mais completa de São Paulo. Processo seletivo simplificado e bolsas disponíveis.',
    bullets: [
      'Processo seletivo simplificado',
      'Bolsas e condições especiais disponíveis',
      'Início de turmas em breve',
    ],
    cta: { label: 'Inscreva-se Agora', href: '#pre-inscricao' },
    ctaSecondary: { label: 'Ver Edital', href: '#processo-seletivo' },
  },
  {
    id: 2,
    image: '/images/banner-2.jpg',
    badge: 'Parceria Exclusiva',
    title: 'IPESSP + Faculdade de Medicina da USP',
    subtitle: 'Juntos formando profissionais de excelência. Estágio prático em Farmácia Oncológica no ICESP – Instituto do Câncer do Estado de São Paulo.',
    bullets: [
      'Farmácia Oncológica Online ao Vivo',
      'Estágio prático no ICESP/FMUSP',
      'Certificado com respaldo da USP',
    ],
    cta: { label: 'Conheça o Curso', href: '#pre-inscricao' },
    ctaSecondary: { label: 'Saiba Mais', href: '#categorias' },
  },
  {
    id: 3,
    image: '/images/banner-3.jpeg',
    badge: 'Pós-Graduação · Estética',
    title: 'Residência Clínica em Harmonização Facial e Corporal',
    subtitle: 'Especialização de excelência em Harmonização Orofacial (HOF) com professores especialistas e laboratórios de última geração.',
    bullets: [
      'Harmonização Orofacial (HOF)',
      'Aulas práticas em laboratório próprio',
      'Clínica Escola aberta aos alunos',
    ],
    cta: { label: 'Inscrições Abertas', href: '#pre-inscricao' },
    ctaSecondary: { label: 'Ver Currículo', href: '#' },
  },
  {
    id: 4,
    image: '/images/banner-4.jpg',
    badge: 'Graduação',
    title: 'Gestão Hospitalar: Lidere o Futuro da Saúde',
    subtitle: 'Graduação em Gestão Hospitalar com grade curricular atualizada, professores mestres e doutores e parcerias com os maiores hospitais de SP.',
    bullets: [
      'Gestão Hospitalar · Biomedicina · Fisioterapia',
      'Estética e Cosmética',
      'Parcerias com HCor, Rede D\'Or e muito mais',
    ],
    cta: { label: 'Conheça a Graduação', href: '#categorias' },
    ctaSecondary: { label: 'Matricule-se', href: '#pre-inscricao' },
  },
  {
    id: 5,
    image: '/images/banner-5.jpg',
    badge: 'Pós-Graduação · Online',
    title: 'Farmácia Oncológica Online ao Vivo',
    subtitle: 'Formação completa para farmacêuticos que querem atuar na oncologia, com estágio prático supervisionado em hospital de referência.',
    bullets: [
      'Aulas Online ao Vivo',
      'Estágio na FMUSP – ICESP',
      'Reconhecido pelo MEC',
    ],
    cta: { label: 'Inscrições Abertas', href: '#pre-inscricao' },
    ctaSecondary: { label: 'Mais Informações', href: '#' },
  },
  {
    id: 6,
    image: '/images/banner-6.jpg',
    badge: '25 Anos de Excelência',
    title: 'Mais de 5.000 Profissionais de Saúde Formados',
    subtitle: 'Fundado em 2000, o IPESSP é referência em formação de profissionais de saúde em São Paulo, com 4.000 m² de infraestrutura e 54 cursos.',
    bullets: [
      '5.000+ especialistas formados',
      '54 cursos de pós-graduação, graduação e livres',
      '5 laboratórios equipados · 2 anfiteatros',
    ],
    cta: { label: 'Nossa História', href: '#' },
    ctaSecondary: { label: 'Inscreva-se', href: '#pre-inscricao' },
  },
];

export default function Hero() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReduced, setPrefersReduced] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const next = useCallback(() => setCurrent(c => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused || prefersReduced) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(next, 5500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, prefersReduced, next]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'min(68vh, 580px)', minHeight: '400px' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Destaques da Faculdade IPESSP"
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700 overflow-hidden"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          aria-hidden={i !== current}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            className="object-cover object-center transition-transform duration-700 ease-out"
            style={{ transform: (i === current && paused) ? 'scale(1.05)' : 'scale(1)' }}
            priority={i === 0}
            unoptimized
            sizes="100vw"
          />
          {/* Gradient only at bottom for arrows/dots contrast */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)',
            }}
          />
        </div>
      ))}

      {/* Arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)' }}
        aria-label="Slide anterior"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.25)' }}
        aria-label="Próximo slide"
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2" role="tablist">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            role="tab"
            aria-selected={i === current}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? '28px' : '8px',
              height: '8px',
              borderRadius: '99px',
              background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      {!prefersReduced && (
        <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div
            key={current}
            className="h-full"
            style={{
              background: 'var(--accent-400)',
              animation: paused ? 'none' : 'heroProgress 5.5s linear forwards',
            }}
          />
        </div>
      )}

    </section>
  );
}
