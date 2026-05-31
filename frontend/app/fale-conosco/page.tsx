'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const canaisContato = [
  {
    titulo: 'Telefone',
    info: '(11) 97692-2127',
    href: 'tel:+5511976922127',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
  },
  {
    titulo: 'WhatsApp',
    info: '(11) 97692-2127',
    href: 'https://wa.me/5511976922127',
    icon: (
      <svg width="26" height="26" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    titulo: 'E-mail',
    info: 'marketing@ipessp.edu.br',
    href: 'mailto:marketing@ipessp.edu.br',
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
  },
];

export default function FaleConosco() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Atendimento
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Fale Conosco
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Nossa equipe está disponível para esclarecer dúvidas sobre cursos, matrículas e financeiro. Entre em contato pelo canal que preferir.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Informações
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '36px' }}>
                  Entre em Contato
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '36px' }}>
                  {canaisContato.map((canal) => (
                    <a
                      key={canal.titulo}
                      href={canal.href}
                      target={canal.href.startsWith('http') ? '_blank' : undefined}
                      rel={canal.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        padding: '20px 24px',
                        background: 'var(--surface-alt)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--line)',
                        textDecoration: 'none',
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-300)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                      }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                        {canal.icon}
                      </div>
                      <div>
                        <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '3px' }}>
                          {canal.titulo}
                        </p>
                        <p style={{ color: 'var(--ink-900)', fontSize: 'var(--fs-body)', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                          {canal.info}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>

                <div style={{ padding: '28px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '8px' }}>
                      Endereço
                    </h3>
                    <address style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', fontStyle: 'normal' }}>
                      Rua Dona Antônia de Queirós, 333<br />
                      Consolação – São Paulo/SP<br />
                      CEP: 01307-012
                    </address>
                  </div>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '10px' }}>
                      Horários de Atendimento
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { dia: 'Segunda a Quinta', hora: '8h – 22h' },
                        { dia: 'Sexta-feira', hora: '8h – 20h' },
                        { dia: 'Sábado e Domingo', hora: '8h – 17h' },
                      ].map(h => (
                        <div key={h.dia} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: 'var(--fs-sm)' }}>
                          <span style={{ color: 'var(--ink-700)' }}>{h.dia}</span>
                          <span style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{h.hora}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Formulário
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '36px' }}>
                  Envie uma Mensagem
                </h2>

                <form style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', transition: 'border-color 0.15s' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                        E-mail *
                      </label>
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', transition: 'border-color 0.15s' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        placeholder="(11) 99999-9999"
                        style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', transition: 'border-color 0.15s' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                      Assunto *
                    </label>
                    <select
                      style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', transition: 'border-color 0.15s' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                    >
                      <option value="">Selecione o assunto</option>
                      <option value="matriculas">Matrículas</option>
                      <option value="pos-graduacao">Pós-Graduação</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                      Mensagem *
                    </label>
                    <textarea
                      placeholder="Escreva sua mensagem aqui..."
                      rows={6}
                      style={{ width: '100%', padding: '14px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', resize: 'vertical', transition: 'border-color 0.15s', fontFamily: 'var(--font-body)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start' }}
                  >
                    Enviar mensagem
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
