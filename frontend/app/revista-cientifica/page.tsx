'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const edicoes = [
  {
    volume: 'Vol. 8, n. 2',
    ano: '2024',
    tema: 'Diagnóstico Laboratorial Avançado',
    artigos: 14,
    descricao: 'Edição com foco em novas metodologias diagnósticas, biomarcadores e técnicas moleculares aplicadas ao laboratório clínico.',
  },
  {
    volume: 'Vol. 8, n. 1',
    ano: '2024',
    tema: 'Estética Clínica e Procedimentos',
    artigos: 12,
    descricao: 'Artigos sobre harmonização orofacial, biomedicina estética, fisiologia da pele e novas tecnologias em procedimentos estéticos.',
  },
  {
    volume: 'Vol. 7, n. 2',
    ano: '2023',
    tema: 'Gestão e Qualidade em Saúde',
    artigos: 11,
    descricao: 'Publicações sobre gestão hospitalar, auditorias, segurança do paciente e indicadores de qualidade assistencial.',
  },
  {
    volume: 'Vol. 7, n. 1',
    ano: '2023',
    tema: 'Enfermagem e Cuidados Intensivos',
    artigos: 13,
    descricao: 'Estudos sobre enfermagem intensiva adulta e pediátrica, protocolos assistenciais e inovações no cuidado ao paciente grave.',
  },
];

const normasSubmissao = [
  { titulo: 'Tipos de artigos aceitos', descricao: 'Artigos originais, artigos de revisão, relatos de caso, comunicações breves e artigos de opinião nas áreas de ciências da saúde.' },
  { titulo: 'Idioma', descricao: 'Português, com resumo obrigatório em inglês (abstract) e palavras-chave nos dois idiomas.' },
  { titulo: 'Extensão', descricao: 'Artigos originais: até 5.000 palavras. Revisões: até 8.000 palavras. Relatos de caso: até 3.000 palavras. Excluindo referências e resumos.' },
  { titulo: 'Formatação', descricao: 'Fonte Times New Roman 12, espaçamento 1,5, margens 2,5 cm. Referências no formato Vancouver. Tabelas e figuras em arquivos separados de alta resolução.' },
  { titulo: 'Avaliação', descricao: 'Todos os manuscritos passam por revisão por pares double-blind com pelo menos dois revisores especialistas na área.' },
  { titulo: 'Prazo de avaliação', descricao: 'A avaliação inicial é concluída em até 30 dias. O processo completo, incluindo revisões, pode durar de 60 a 90 dias.' },
];

export default function RevistaCientifica() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Publicação Científica
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '16px' }}>
              Revista Científica<br />
              <span style={{ color: 'var(--accent-400)' }}>IPESSP — RCF</span>
            </h1>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-pill)', padding: '5px 16px', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                ISSN: 2764-1082 (online)
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-pill)', padding: '5px 16px', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                Periodicidade Semestral
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)', marginBottom: '36px' }}>
              Publicação periódica com artigos científicos de alta qualidade nas áreas de ciências da saúde, tecnologia e gestão em saúde. Indexada e de acesso aberto.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <a href="https://rcfipessp.com.br/index.php/rcfipessp" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Acessar revista
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <a href="#submissao" className="btn btn-white">
                Submeter artigo
              </a>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: 'clamp(48px,6vw,80px)' }}>
              {[
                { numero: '8', label: 'Anos de publicação' },
                { numero: '15+', label: 'Edições publicadas' },
                { numero: '180+', label: 'Artigos publicados' },
                { numero: '2', label: 'Edições por ano' },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    textAlign: 'center',
                    padding: '28px 20px',
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--line)',
                  }}
                >
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,4vw,2.5rem)', fontWeight: 800, color: 'var(--brand-600)', lineHeight: 1, marginBottom: '8px' }}>
                    {stat.numero}
                  </p>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Edições anteriores
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Edições Publicadas
              </h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {edicoes.map((edicao) => (
                <article
                  key={`${edicao.volume}-${edicao.ano}`}
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
                  <div style={{ height: '120px', background: 'linear-gradient(135deg, var(--brand-800) 0%, var(--brand-600) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--accent-400)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                        RCF – IPESSP
                      </p>
                      <p style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>
                        {edicao.volume} · {edicao.ano}
                      </p>
                    </div>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                    <span style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.72rem', fontWeight: 700, alignSelf: 'flex-start' }}>
                      {edicao.artigos} artigos
                    </span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                      {edicao.tema}
                    </h3>
                    <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', flex: 1 }}>
                      {edicao.descricao}
                    </p>
                    <a
                      href="https://rcfipessp.com.br/index.php/rcfipessp"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}
                    >
                      Ver edição
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="submissao" className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Para autores
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '16px' }}>
                Normas de Submissão
              </h2>
              <p style={{ color: 'var(--ink-700)', maxWidth: '520px', margin: '0 auto', lineHeight: 'var(--lh-body)' }}>
                A RCF recebe submissões contínuas. Leia atentamente as normas antes de enviar seu manuscrito.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '48px' }}>
              {normasSubmissao.map((norma) => (
                <div
                  key={norma.titulo}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand-600)', flexShrink: 0 }} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                      {norma.titulo}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', paddingLeft: '18px' }}>
                    {norma.descricao}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <a
                href="https://rcfipessp.com.br/index.php/rcfipessp"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Submeter artigo na plataforma
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
              </a>
              <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)', marginTop: '16px' }}>
                Dúvidas sobre submissão? Contate{' '}
                <a href="mailto:revista@ipessp.edu.br" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                  revista@ipessp.edu.br
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
