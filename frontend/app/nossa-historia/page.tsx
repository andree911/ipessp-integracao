import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const timeline = [
  { year: '2000', text: 'Fundação do IPESSP — primeiras aulas realizadas em hotéis de São Paulo nos fins de semana, reunindo profissionais de saúde em busca de atualização.' },
  { year: '2002', text: 'Aprovação no Programa Sebrae, consolidando a gestão e o modelo de negócio da instituição.' },
  { year: '2003', text: 'Inauguração da primeira sede própria no bairro dos Jardins, em São Paulo.' },
  { year: '2004', text: 'Criação dos primeiros programas de pós-graduação lato sensu nas áreas de saúde.' },
  { year: '2008', text: 'Reconhecimento oficial pelo MEC para oferta de cursos de pós-graduação.' },
  { year: '2015', text: 'Credenciamento pelo MEC para oferta de cursos de graduação, ampliando o portfólio acadêmico.' },
  { year: '2018', text: 'Transferência para a nova e ampla sede na Rua Dona Antônia de Queirós, 333 — Consolação, com 4.000 m² de área.' },
  { year: '2022', text: '22 anos de trajetória com mais de 5.000 profissionais de saúde especializados. Referência nacional em educação continuada.' },
];

const valores = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    titulo: 'Missão',
    texto: 'Promover a atualização acadêmica de profissionais da saúde com prática ética e responsável, contribuindo para a melhoria dos serviços de saúde no Brasil.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
      </svg>
    ),
    titulo: 'Visão',
    texto: 'Ser referência nacional em educação continuada nas ciências da saúde, reconhecida pela qualidade, inovação e pelo impacto positivo na carreira de nossos alunos.',
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
      </svg>
    ),
    titulo: 'Valores',
    texto: 'Ensino de qualidade, respeito humano, ética, transparência e sustentabilidade — princípios que guiam cada decisão e cada relação no IPESSP.',
  },
];

const fundadores = [
  {
    iniciais: 'JLM',
    cor: '#9b1c1c',
    nome: 'Dr. José Lúcio Martins Machado',
    titulo: 'Doutor em Cirurgia Geral',
    descricao: 'Co-fundador do IPESSP, trouxe sua expertise em cirurgia geral para estruturar os primeiros programas acadêmicos da instituição.',
  },
  {
    iniciais: 'JP',
    cor: '#7d1717',
    nome: 'Dra. Juliana Pereira',
    titulo: 'Doutora em Hematologia — USP',
    descricao: 'Co-fundadora, especialista em Hematologia pela Universidade de São Paulo, responsável pela visão científica que moldou o DNA acadêmico do IPESSP.',
  },
  {
    iniciais: 'NA',
    cor: '#5c1111',
    nome: 'Nilva Aparecida Oliveira',
    titulo: 'Biologista — Responsável Atual',
    descricao: 'Co-fundadora e responsável atual pela instituição, biologista com visão estratégica que conduziu o crescimento e a consolidação do IPESSP ao longo de 25 anos.',
  },
];

const stats = [
  { numero: '25', label: 'Anos de história' },
  { numero: '5.000+', label: 'Profissionais especializados' },
  { numero: '54', label: 'Cursos disponíveis' },
  { numero: '5', label: 'Laboratórios equipados' },
];

export default function NossaHistoria() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Institucional
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Nossa História
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Há 25 anos formando profissionais de saúde com excelência, ética e compromisso com a sociedade brasileira.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', marginBottom: 'clamp(48px,6vw,80px)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '20px' }}>
                Uma instituição nascida da necessidade
              </h2>
              <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)' }}>
                O IPESSP surgiu em 2000 da visão de três profissionais da saúde que identificaram uma lacuna urgente: a necessidade de atualização contínua dos profissionais da área em São Paulo. O que começou em salões de hotéis nos fins de semana tornou-se uma das mais respeitadas instituições de ensino na área da saúde do país.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
              {valores.map((v) => (
                <div
                  key={v.titulo}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '36px 32px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    {v.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {v.titulo}
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    {v.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                25 anos de evolução
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Nossa Linha do Tempo
              </h2>
            </div>

            <div style={{ position: 'relative', maxWidth: '860px', margin: '0 auto' }}>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: 'var(--line)', transform: 'translateX(-50%)' }} className="hidden md:block" />

              <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
                {timeline.map((item, idx) => {
                  const isLeft = idx % 2 === 0;
                  return (
                    <div key={item.year} style={{ display: 'flex', alignItems: 'center', justifyContent: isLeft ? 'flex-start' : 'flex-end', gap: '0', position: 'relative' }}>
                      <div
                        style={{
                          width: 'calc(50% - 32px)',
                          background: 'var(--surface)',
                          borderRadius: 'var(--radius-md)',
                          padding: '24px 28px',
                          boxShadow: 'var(--shadow-sm)',
                          border: '1px solid var(--line)',
                          marginLeft: isLeft ? '0' : 'auto',
                          marginRight: isLeft ? 'auto' : '0',
                        }}
                        className="timeline-card"
                      >
                        <span style={{ display: 'inline-block', background: 'var(--brand-600)', color: 'white', borderRadius: 'var(--radius-pill)', padding: '4px 14px', fontSize: 'var(--fs-sm)', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '12px' }}>
                          {item.year}
                        </span>
                        <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                          {item.text}
                        </p>
                      </div>
                      <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--brand-600)', border: '3px solid var(--surface)', zIndex: 1 }} className="hidden md:block" />
                    </div>
                  );
                })}
              </div>
            </div>

            <style>{`
              @media (max-width: 768px) {
                .timeline-card { width: 100% !important; margin-left: 0 !important; margin-right: 0 !important; }
              }
            `}</style>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Quem fundou o IPESSP
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Os Fundadores
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
              {fundadores.map((f) => (
                <div
                  key={f.nome}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '36px 28px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: f.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.04em', flexShrink: 0 }}>
                    {f.iniciais}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
                      {f.nome}
                    </h3>
                    <p style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '12px' }}>
                      {f.titulo}
                    </p>
                    <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                      {f.descricao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,64px)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white' }}>
                IPESSP em números
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: 'center', padding: '32px 20px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.2rem,5vw,3rem)', fontWeight: 800, color: 'var(--accent-400)', lineHeight: 1, marginBottom: '10px' }}>
                    {s.numero}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
