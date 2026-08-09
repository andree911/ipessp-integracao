'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const cursosDisponiveis = [
  { nome: 'Biomedicina Estética Avançada', tipo: 'Pós-Graduação', modalidade: 'Presencial' },
  { nome: 'Análises Clínicas – Da Prática à Clínica', tipo: 'Pós-Graduação', modalidade: 'Presencial' },
  { nome: 'Enfermagem Estética', tipo: 'Pós-Graduação', modalidade: 'Presencial' },
  { nome: 'Harmonização Orofacial (HOF)', tipo: 'Pós-Graduação', modalidade: 'Presencial' },
  { nome: 'Farmácia Clínica e Atenção Farmacêutica', tipo: 'Pós-Graduação', modalidade: 'EAD' },
  { nome: 'Administração Hospitalar', tipo: 'Pós-Graduação', modalidade: 'Online ao Vivo' },
  { nome: 'Análises Clínicas EAD', tipo: 'Curso Livre', modalidade: 'EAD' },
  { nome: 'Biomedicina Estética Avançada EAD', tipo: 'Curso Livre', modalidade: 'EAD' },
];

const diferenciais = [
  {
    titulo: 'Infraestrutura Moderna',
    texto: 'Salas de aula climatizadas, laboratórios equipados e espaços de convivência projetados para o aprendizado.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    titulo: 'Professores Locais',
    texto: 'Corpo docente com profissionais atuantes no mercado do Vale do Paraíba, com experiência regional.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
  },
  {
    titulo: 'Mesmo padrão IPESSP',
    texto: 'Toda a qualidade e reconhecimento do IPESSP de São Paulo, agora no Vale do Paraíba.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    titulo: 'Fácil Acesso',
    texto: 'Localização central em São José dos Campos, próximo ao terminal de ônibus e com estacionamento disponível.',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 6.9 8 11.7z"/>
      </svg>
    ),
  },
];

export default function PoloSaoJoseDosComp() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Polo Regional
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Polo São José dos Campos
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              A qualidade do ensino IPESSP agora no Vale do Paraíba. Cursos de pós-graduação e capacitação para profissionais de saúde de toda a região.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Localização
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '28px' }}>
                  Onde nos Encontrar
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="10" r="3"/><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 10-16 0c0 3 2.7 6.9 8 11.7z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
                        Endereço
                      </h3>
                      <address style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', fontStyle: 'normal' }}>
                        Av. Dr. João Guilhermino, 429 — Centro<br />
                        São José dos Campos/SP<br />
                        CEP: 12210-131
                      </address>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
                        Contato do Polo
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <a href="tel:+551232270000" style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none' }}>
                          (12) 3227-0000
                        </a>
                        <a href="https://wa.me/5512991230000" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none' }}>
                          WhatsApp: (12) 99123-0000
                        </a>
                        <a href="mailto:sjc@ipessp.edu.br" style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none' }}>
                          sjc@ipessp.edu.br
                        </a>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
                        Horários
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {[
                          { dia: 'Segunda a Quinta', hora: '8h – 22h' },
                          { dia: 'Sexta-feira', hora: '8h – 20h' },
                          { dia: 'Sábado e Domingo', hora: '8h – 17h' },
                        ].map(h => (
                          <div key={h.dia} style={{ display: 'flex', gap: '12px', fontSize: 'var(--fs-sm)', color: 'var(--ink-700)' }}>
                            <span>{h.dia}:</span>
                            <span style={{ fontWeight: 600, color: 'var(--ink-900)' }}>{h.hora}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Como chegar
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '28px' }}>
                  Acesso ao Polo
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[
                    { transporte: 'De Carro', instrucoes: 'Localizado no Centro de São José dos Campos, a 5 min do Terminal Central. Estacionamentos conveniados disponíveis nas proximidades. Acesso pela Av. Dr. João Guilhermino.' },
                    { transporte: 'De Ônibus', instrucoes: 'Linhas 200, 201 e 315 têm parada a 200m do polo. Desça no ponto "Centro – Prefeitura" e siga pela Av. Dr. João Guilhermino.' },
                    { transporte: 'De São Paulo', instrucoes: 'Acesso via Rodovia Presidente Dutra (BR-116). Tempo médio de 1h30. Ônibus intermunicipais do Terminal Tietê com chegada no Terminal Central de SJC.' },
                  ].map(item => (
                    <div
                      key={item.transporte}
                      style={{ padding: '20px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}
                    >
                      <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink-900)', fontSize: '0.95rem', marginBottom: '8px' }}>
                        {item.transporte}
                      </h4>
                      <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                        {item.instrucoes}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Oferta no polo
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Cursos Disponíveis em SJC
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {cursosDisponiveis.map((curso) => (
                <div
                  key={curso.nome}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                >
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {curso.tipo}
                    </span>
                    <span style={{ background: 'rgba(233,185,73,0.15)', color: '#8a6800', borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>
                      {curso.modalidade}
                    </span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.35 }}>
                    {curso.nome}
                  </h3>
                  <a
                    href="https://wa.me/5512991230000"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}
                  >
                    Saiba mais
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Diferenciais do Polo
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {diferenciais.map((d) => (
                <div
                  key={d.titulo}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
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

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', maxWidth: '560px', margin: '0 auto 20px' }}>
              Estude em São José dos Campos
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '440px', margin: '0 auto 36px', lineHeight: 'var(--lh-body)' }}>
              Fale com nossa equipe no polo de SJC e garanta sua vaga nos cursos disponíveis na região.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/5512991230000" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Falar com o Polo SJC
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
