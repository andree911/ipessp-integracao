'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { WHATSAPP_URL } from '@/lib/contato';

const posts = [
  {
    titulo: 'Carreira em Biomedicina: perspectivas e oportunidades em 2025',
    categoria: 'Carreira',
    data: '15 de maio de 2025',
    resumo: 'O mercado de trabalho para biomédicos cresce a cada ano. Conheça as principais áreas de atuação, salários médios e como a pós-graduação pode acelerar sua carreira.',
    slug: '#',
  },
  {
    titulo: 'Harmonização Orofacial: o que é, quem pode realizar e como se especializar',
    categoria: 'Saúde',
    data: '8 de maio de 2025',
    resumo: 'A harmonização orofacial tornou-se uma das áreas de maior crescimento na saúde estética. Entenda os procedimentos, as habilitações necessárias e como o IPESSP forma profissionais nessa área.',
    slug: '#',
  },
  {
    titulo: 'IPESSP abre novas turmas de Pós-Graduação em Enfermagem Intensiva',
    categoria: 'Novidades',
    data: '2 de maio de 2025',
    resumo: 'A partir de junho, novas turmas de Enfermagem Intensiva Adulto e Pediátrica estarão disponíveis. Saiba mais sobre o programa e como garantir sua vaga.',
    slug: '#',
  },
  {
    titulo: 'Análises Clínicas: a importância do diagnóstico laboratorial na medicina moderna',
    categoria: 'Saúde',
    data: '24 de abril de 2025',
    resumo: 'Os exames laboratoriais são responsáveis por cerca de 70% das decisões clínicas. Entenda o papel fundamental do biomédico e do técnico em análises clínicas nesse contexto.',
    slug: '#',
  },
  {
    titulo: 'Como se preparar para a pós-graduação na área da saúde',
    categoria: 'Pós-Graduação',
    data: '17 de abril de 2025',
    resumo: 'Escolher a especialização certa pode ser desafiador. Confira um guia completo com dicas sobre como avaliar cursos, instituições e compatibilidade com sua carreira.',
    slug: '#',
  },
  {
    titulo: 'Gestão Hospitalar: por que o setor de saúde precisa de gestores bem formados',
    categoria: 'Carreira',
    data: '10 de abril de 2025',
    resumo: 'Com o crescimento dos planos de saúde e redes hospitalares, a demanda por gestores qualificados nunca foi tão alta. Entenda por que a graduação em Gestão Hospitalar é uma escolha estratégica.',
    slug: '#',
  },
  {
    titulo: 'IPESSP firma nova parceria com hospital de referência em SP',
    categoria: 'Novidades',
    data: '3 de abril de 2025',
    resumo: 'A Faculdade IPESSP anuncia parceria com um hospital de referência na capital paulista para ampliar as oportunidades de estágio e residência para nossos alunos.',
    slug: '#',
  },
  {
    titulo: 'Fisioterapia Esportiva: especialização que abre portas no esporte de alto rendimento',
    categoria: 'Carreira',
    data: '27 de março de 2025',
    resumo: 'Times de futebol, atletas olímpicos e academias de alto nível buscam fisioterapeutas especializados. Veja como a formação no IPESSP prepara profissionais para esse mercado.',
    slug: '#',
  },
];

const categoriaCor: Record<string, { bg: string; color: string }> = {
  'Carreira': { bg: 'rgba(155,28,28,0.08)', color: 'var(--brand-700)' },
  'Saúde': { bg: 'rgba(16,122,87,0.1)', color: '#065f46' },
  'Novidades': { bg: 'rgba(233,185,73,0.15)', color: '#8a6800' },
  'Pós-Graduação': { bg: 'rgba(124,58,237,0.08)', color: '#7c3aed' },
};

const todasCategorias = ['Todos', 'Carreira', 'Saúde', 'Novidades', 'Pós-Graduação'];

export default function Blog() {
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todos');
  const postsFiltrados = categoriaAtiva === 'Todos' ? posts : posts.filter(p => p.categoria === categoriaAtiva);

  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Conteúdo
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Blog IPESSP
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Artigos, novidades e conteúdos especializados sobre saúde, carreiras e educação para profissionais da área.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '48px' }}>
              {todasCategorias.map((cat) => {
                const ativo = cat === categoriaAtiva;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoriaAtiva(cat)}
                    style={{
                      background: ativo ? 'var(--brand-600)' : 'var(--surface-alt)',
                      color: ativo ? 'white' : 'var(--ink-700)',
                      border: ativo ? '2px solid var(--brand-600)' : '2px solid var(--line)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '8px 20px',
                      fontSize: 'var(--fs-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '28px' }}>
              {postsFiltrados.map((post) => {
                const cor = categoriaCor[post.categoria] ?? { bg: 'var(--surface-alt)', color: 'var(--ink-700)' };
                return (
                  <article
                    key={post.titulo}
                    style={{
                      background: 'var(--surface-alt)',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--line)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.boxShadow = '';
                      (e.currentTarget as HTMLElement).style.transform = '';
                    }}
                  >
                    <div style={{ height: '160px', background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--brand-600) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="48" height="48" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                      </svg>
                    </div>
                    <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ background: cor.bg, color: cor.color, borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {post.categoria}
                        </span>
                        <span style={{ color: 'var(--ink-500)', fontSize: '0.75rem' }}>
                          {post.data}
                        </span>
                      </div>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.35 }}>
                        {post.titulo}
                      </h2>
                      <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', flex: 1 }}>
                        {post.resumo}
                      </p>
                      {post.slug !== '#' ? (
                        <a
                          href={post.slug}
                          style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}
                        >
                          Leia mais
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                          </svg>
                        </a>
                      ) : (
                        <span style={{ color: 'var(--ink-400)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginTop: 'auto' }}>
                          Em breve
                        </span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--surface-alt)', borderTop: '1px solid var(--line)' }} className="py-16">
          <div className="container-site" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '12px' }}>
              Fique por dentro das novidades
            </h2>
            <p style={{ color: 'var(--ink-700)', maxWidth: '440px', margin: '0 auto 28px', lineHeight: 'var(--lh-body)' }}>
              Siga o IPESSP nas redes sociais e receba conteúdos exclusivos sobre saúde, carreiras e oportunidades de especialização.
            </p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
              Seguir no WhatsApp
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
