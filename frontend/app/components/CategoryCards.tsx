'use client';

import Image from 'next/image';

/* 4 cursos de graduação reais + pós + livres */
const categories = [
  {
    label: 'Biomedicina',
    tag: 'Graduação',
    description: 'Diagnóstico clínico e laboratorial de excelência',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=90',
    href: '#pre-inscricao',
  },
  {
    label: 'Pós-Graduação & MBA',
    tag: '54 cursos disponíveis',
    description: 'Cardiologia, Estética, Enfermagem, Farmácia e muito mais',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=90',
    href: '#pre-inscricao',
  },
  {
    label: 'Estética e Cosmética',
    tag: 'Graduação',
    description: 'Harmonização Orofacial, Biomedicina Estética e Enfermagem Estética',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=90',
    href: '#pre-inscricao',
  },
  {
    label: 'Cursos Livres & EAD',
    tag: 'Capacitação · Atualização',
    description: 'Modalidades presenciais, online ao vivo e 40% EAD',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?auto=format&fit=crop&w=800&q=90',
    href: '#pre-inscricao',
  },
];

export default function CategoryCards() {
  return (
    <section id="categorias" className="section-gap" style={{ background: 'var(--surface-alt)' }}>
      <div className="container-site">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2"
            style={{ color: 'var(--brand-500)' }}>
            Área de Formação
          </p>
          <h2 className="font-bold"
            style={{
              fontFamily: 'var(--font-sora, var(--font-display))',
              fontSize: 'var(--fs-h1)',
              color: 'var(--ink-900)',
            }}>
            Encontre seu Caminho na Saúde
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm" style={{ color: 'var(--ink-500)' }}>
            Graduação, Pós-Graduação, MBA e Cursos Livres — tudo na maior faculdade de saúde da Consolação.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <a
              key={cat.label}
              href={cat.href}
              className="group relative overflow-hidden block"
              style={{
                borderRadius: 'var(--radius-lg)',
                aspectRatio: '3/4',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {/* Gradient */}
              <div
                className="absolute inset-0 transition-opacity duration-300 group-hover:opacity-90"
                style={{
                  background:
                    'linear-gradient(to top, rgba(61,11,11,0.95) 0%, rgba(61,11,11,0.4) 50%, transparent 100%)',
                }}
              />
              {/* Tag */}
              <div className="absolute top-4 left-4">
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'var(--accent-400)', color: 'var(--ink-900)' }}
                >
                  {cat.tag}
                </span>
              </div>
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3
                  className="font-bold mb-1 leading-tight"
                  style={{
                    fontFamily: 'var(--font-sora, var(--font-display))',
                    fontSize: 'var(--fs-h3)',
                  }}
                >
                  {cat.label}
                </h3>
                <p className="text-white/75 text-sm leading-snug mb-3">
                  {cat.description}
                </p>
                <div
                  className="flex items-center gap-2 text-sm font-semibold text-white/90 group-hover:gap-3 transition-all"
                >
                  <span>Saiba mais</span>
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    className="transition-transform group-hover:translate-x-1">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Graduação pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            'Gestão Hospitalar', 'Biomedicina', 'Estética e Cosmética', 'Fisioterapia'
          ].map(curso => (
            <a
              key={curso}
              href="#pre-inscricao"
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all"
              style={{ borderColor: 'var(--brand-200)', color: 'var(--brand-700)', background: 'var(--brand-50)' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--brand-600)';
                (e.currentTarget as HTMLElement).style.color = '#fff';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-600)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)';
                (e.currentTarget as HTMLElement).style.color = 'var(--brand-700)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-200)';
              }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"/>
              </svg>
              {curso}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
