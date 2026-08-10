'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const cursos = [
  {
    nome: 'Gestão Hospitalar',
    duracao: '4 anos',
    modalidade: 'Presencial',
    descricao: 'Forme-se para liderar hospitais, clínicas e serviços de saúde com visão estratégica, financeira e assistencial. O curso prepara gestores capazes de transformar a realidade dos serviços de saúde no Brasil.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 9h6M9 12h6M9 15h4"/>
      </svg>
    ),
  },
  {
    nome: 'Biomedicina',
    duracao: '4 anos',
    modalidade: 'Presencial',
    descricao: 'Atue em análises clínicas, pesquisa científica, diagnóstico por imagem, banco de sangue e biotecnologia. Uma carreira ampla e em constante crescimento no setor de saúde.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
    ),
  },
  {
    nome: 'Estética e Cosmética',
    duracao: '3 anos',
    modalidade: 'Presencial',
    descricao: 'Domine procedimentos estéticos avançados, harmonização orofacial e cosmetologia. Um dos cursos com maior empregabilidade e crescimento no mercado brasileiro de beleza e saúde.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    nome: 'Enfermagem',
    duracao: '4 anos',
    modalidade: 'Presencial',
    descricao: 'Forme-se para atuar no cuidado direto ao paciente, na gestão de equipes de enfermagem e em toda a rede de atenção à saúde. Um dos cursos com maior empregabilidade da área da saúde.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
];

const diferenciais = [
  {
    titulo: 'MEC Credenciado',
    texto: 'Instituição credenciada pelo Ministério da Educação. Diploma com validade nacional e reconhecimento em todo o território brasileiro.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    titulo: 'Parceria com Hospitais',
    texto: 'Estágios supervisionados em hospitais e clínicas parceiras de São Paulo, garantindo experiência prática desde os primeiros semestres.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
      </svg>
    ),
  },
  {
    titulo: 'Professores Mestres e Doutores',
    texto: 'Corpo docente altamente qualificado com titulação stricto sensu e atuação ativa no mercado profissional da área da saúde.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
  },
  {
    titulo: 'Laboratórios Equipados',
    texto: 'Cinco laboratórios com equipamentos modernos para prática das disciplinas de análises clínicas, biomedicina, estética e fisioterapia.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M10 2v7.527a2 2 0 01-.211.896L4.72 17.1A2 2 0 006.474 20h11.052a2 2 0 001.754-2.9l-5.069-6.677A2 2 0 0114 9.527V2"/><path d="M8.5 2h7"/>
      </svg>
    ),
  },
];

export default function Graduacao() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Ensino Superior
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Graduação
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)', marginBottom: '36px' }}>
              4 cursos de graduação presenciais com diplomas reconhecidos pelo MEC: Enfermagem, Biomedicina, Estética e Cosmética e Gestão Hospitalar. Comece sua trajetória na área da saúde com quem tem 25 anos de excelência.
            </p>
            <a href="#cursos" className="btn btn-primary">
              Ver cursos
            </a>
          </div>
        </section>

        <section id="cursos" className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Nossos cursos
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Escolha sua área de atuação
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '28px' }}>
              {cursos.map((curso) => (
                <div
                  key={curso.nome}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '40px 32px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
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
                  <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    {curso.icon}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--ink-900)' }}>
                      {curso.nome}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--brand-100)', color: 'var(--brand-700)', borderRadius: 'var(--radius-pill)', padding: '4px 14px', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                        {curso.duracao}
                      </span>
                      <span style={{ background: 'rgba(233,185,73,0.15)', color: '#8a6800', borderRadius: 'var(--radius-pill)', padding: '4px 14px', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                        {curso.modalidade}
                      </span>
                    </div>
                  </div>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', flex: 1 }}>
                    {curso.descricao}
                  </p>
                  <a
                    href="#matricula"
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', fontSize: 'var(--fs-sm)', padding: '10px 22px' }}
                  >
                    Saiba mais
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Por que IPESSP
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Nossos Diferenciais
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {diferenciais.map((d) => (
                <div
                  key={d.titulo}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    {d.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {d.titulo}
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    {d.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="matricula" style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
              Processo Seletivo Aberto
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', maxWidth: '600px', margin: '0 auto 20px' }}>
              Comece sua graduação em 2025
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 'var(--lh-body)' }}>
              Faça sua pré-inscrição agora e garanta sua vaga. Nossa equipe entrará em contato com todas as informações sobre o processo seletivo.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/5511976922127" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Falar com consultor
              </a>
              <a href="/fale-conosco" className="btn btn-white">
                Solicitar informações
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
