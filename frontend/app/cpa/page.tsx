import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const relatorios = [
  { titulo: 'Relatório 2023 – Comissão Própria de Avaliação IPESSP' },
  { titulo: 'Informativo CPA EAD 2023' },
  { titulo: 'Nomeação CPA IPESSP 2023' },
  { titulo: 'Informativo Substituição CPA 2023' },
  { titulo: 'Relatório 2022 – Comissão Própria de Avaliação IPESSP' },
  { titulo: 'Relatório 2021 – Comissão Própria de Avaliação IPESSP' },
  { titulo: 'Projeto de Autoavaliação Faculdade IPESSP 2023' },
  { titulo: 'CPA – Site IPESSP (2025)' },
];

export default function CpaPage() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site text-white">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Institucional
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)' }}
              className="font-bold mb-4"
            >
              CPA – Comissão Própria de Avaliação
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Responsável pela avaliação institucional interna do IPESSP, a CPA atua de forma
              independente e transparente para a melhoria contínua da qualidade do ensino.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Documentos
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold mb-4"
              >
                Documentos da CPA
              </h2>
              <p style={{ color: 'var(--ink-500)', maxWidth: '520px' }} className="mx-auto">
                Na lista abaixo estão alguns documentos da nossa Comissão Própria de Avaliação (CPA).
              </p>
            </div>
            <div className="max-w-2xl mx-auto flex flex-col gap-3">
              {relatorios.map(r => (
                <div
                  key={r.titulo}
                  className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 style={{ color: 'var(--ink-900)', fontWeight: 600, fontSize: '0.9375rem' }} className="mb-0.5">
                      {r.titulo}
                    </h4>
                  </div>
                  <a
                    href="mailto:cpa@ipessp.edu.br"
                    className="text-sm font-semibold flex items-center gap-1.5 flex-shrink-0"
                    style={{ color: 'var(--brand-600)' }}
                  >
                    Solicitar
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              ))}
            </div>
            <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem', textAlign: 'center' }} className="mt-6">
              Para acesso aos relatórios completos, entre em contato pelo e-mail{' '}
              <a href="mailto:cpa@ipessp.edu.br" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>
                cpa@ipessp.edu.br
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
