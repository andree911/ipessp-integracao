'use client';

import { useState } from 'react';
import Image from 'next/image';

/* Depoimentos reais extraídos do site ipessp.edu.br */
const depoimentos = [
  {
    id: 1,
    nome: 'Valeska Silveira',
    curso: 'Pós-Graduação em Hematologia, Hemoterapia e Biologia Molecular',
    texto:
      'Fiz cursos de Atualização, Capacitação e duas Pós-graduações em Hematologia e Hemoterapia e Biologia Molecular que me ajudaram a conseguir uma colocação profissional e a prestar um bom serviço.',
    estrelas: 5,
    avatar: '/images/banner-2.jpg',
    atuacao: 'Especialista em Biologia Molecular',
  },
  {
    id: 2,
    nome: 'Sheila Menegati',
    curso: 'Pós-Graduação em Hematologia Laboratorial e Hemoterapia',
    texto:
      'Após me tornar especialista em Hematologia Laboratorial e Hemoterapia pelo IPESSP, fui convidada a ser docente no CEUNSP, em Itu. O IPESSP abriu portas que eu não imaginava.',
    estrelas: 5,
    avatar: '/images/banner-3.jpeg',
    atuacao: 'Docente no CEUNSP – Itu/SP',
  },
  {
    id: 3,
    nome: 'Andressa Germano',
    curso: 'Pós-Graduação em Citologia Clínica',
    texto:
      'Tornei-me especialista em Citologia Clínica com ênfase em citologia cérvico-vaginal pelo IPESSP e atualmente sou Histotécnica no Hospital Brigadeiro. A formação prática foi fundamental.',
    estrelas: 5,
    avatar: '/images/banner-4.jpg',
    atuacao: 'Histotécnica – Hospital Brigadeiro',
  },
  {
    id: 4,
    nome: 'Karen Nogueira',
    curso: 'Pós-Graduação em Hematologia e Hemoterapia Laboratorial',
    texto:
      'Tornei-me especialista em Hematologia e Hemoterapia Laboratorial pelo IPESSP e atualmente sou docente no próprio IPESSP e também em outras instituições. O curso mudou minha trajetória profissional.',
    estrelas: 5,
    avatar: '/images/banner-5.jpg',
    atuacao: 'Docente – IPESSP e outras instituições',
  },
];

export default function Depoimentos() {
  const [current, setCurrent] = useState(0);
  const perPage = 3;
  const maxStart = depoimentos.length - perPage;

  const shown = depoimentos.slice(current, current + perPage);

  return (
    <section className="section-gap" style={{ background: 'var(--surface)' }}>
      <div className="container-site">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: 'var(--brand-500)' }}>
              Quem já estudou aqui
            </p>
            <h2 className="font-bold"
              style={{
                fontFamily: 'var(--font-sora, var(--font-display))',
                fontSize: 'var(--fs-h1)',
                color: 'var(--ink-900)',
              }}>
              Depoimentos
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrent(c => Math.max(0, c - 1))}
              disabled={current === 0}
              className="w-10 h-10 rounded-full border flex items-center justify-center transition-all disabled:opacity-30"
              style={{ borderColor: 'var(--line)', color: 'var(--ink-500)' }}
              aria-label="Anterior"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m15 18-6-6 6-6"/>
              </svg>
            </button>
            <button
              onClick={() => setCurrent(c => Math.min(maxStart, c + 1))}
              disabled={current >= maxStart}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-30"
              style={{ background: 'var(--brand-600)', color: '#fff' }}
              aria-label="Próximo"
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="m9 18 6-6-6-6"/>
              </svg>
            </button>
            <a href="/depoimentos" className="btn btn-outline text-sm py-2 px-4 hidden sm:inline-flex">
              Outros Depoimentos
            </a>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {shown.map(d => (
            <div
              key={d.id}
              className="bg-white p-7 flex flex-col gap-5 rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--line)' }}
            >
              {/* Quote icon */}
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--brand-50)' }}>
                <svg width="20" height="20" fill="var(--brand-400)" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                </svg>
              </div>

              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: d.estrelas }).map((_, i) => (
                  <svg key={i} width="16" height="16" fill="var(--accent-400)" viewBox="0 0 24 24">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>

              {/* Texto */}
              <p className="flex-1 leading-relaxed italic"
                style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)' }}>
                &ldquo;{d.texto}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--line)' }}>
                <div
                  className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0"
                  style={{ border: '3px solid var(--brand-200)' }}
                >
                  <Image src={d.avatar} alt={d.nome} width={48} height={48} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--ink-900)' }}>
                    {d.nome}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--brand-600)' }}>
                    {d.atuacao}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-500)' }}>
                    {d.curso}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <a href="/depoimentos" className="btn btn-outline text-sm">Outros Depoimentos</a>
        </div>
      </div>
    </section>
  );
}
