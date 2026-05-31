import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const funcoes = [
  {
    title: 'Avaliação do Ensino',
    description:
      'Avalia sistematicamente as condições de ensino, incluindo a qualificação do corpo docente, os planos de curso e os resultados de aprendizagem dos alunos.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: 'Avaliação da Infraestrutura',
    description:
      'Analisa as condições físicas e tecnológicas da instituição, incluindo salas de aula, laboratórios, biblioteca e recursos didáticos disponíveis.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    title: 'Avaliação da Gestão Institucional',
    description:
      'Examina a eficiência administrativa, os processos de gestão acadêmica e o cumprimento do Plano de Desenvolvimento Institucional (PDI).',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    title: 'Relatórios de Autoavaliação',
    description:
      'Elabora e publica periodicamente relatórios de autoavaliação institucional, fornecendo transparência à comunidade acadêmica e ao MEC.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
];

const membros = [
  { grupo: 'Corpo Docente', descricao: 'Representantes eleitos pelos professores dos diferentes cursos.' },
  { grupo: 'Corpo Técnico-Administrativo', descricao: 'Servidores que atuam nas áreas de apoio acadêmico e administrativo.' },
  { grupo: 'Corpo Discente', descricao: 'Alunos eleitos pelos estudantes dos cursos de graduação e pós-graduação.' },
  { grupo: 'Sociedade Civil', descricao: 'Representante da comunidade externa, indicado pela Direção.' },
];

const relatorios = [
  { titulo: 'Relatório de Autoavaliação 2024', ano: '2024', periodo: 'Ciclo Avaliativo 2022–2024' },
  { titulo: 'Relatório de Autoavaliação 2023', ano: '2023', periodo: 'Ciclo Avaliativo 2022–2024' },
  { titulo: 'Relatório de Autoavaliação 2022', ano: '2022', periodo: 'Ciclo Avaliativo 2022–2024' },
  { titulo: 'Relatório de Autoavaliação 2021', ano: '2021', periodo: 'Ciclo Avaliativo 2019–2021' },
  { titulo: 'Relatório de Autoavaliação 2020', ano: '2020', periodo: 'Ciclo Avaliativo 2019–2021' },
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              <div>
                <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Sobre a CPA
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                  className="font-bold mb-5"
                >
                  O que é a CPA e qual seu papel?
                </h2>
                <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }} className="mb-4">
                  A Comissão Própria de Avaliação (CPA) é um órgão colegiado exigido pelo Sistema Nacional
                  de Avaliação da Educação Superior (SINAES), instituído pela Lei nº 10.861/2004. Ela é
                  responsável pela condução dos processos de avaliação interna da instituição de ensino superior.
                </p>
                <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }} className="mb-6">
                  No IPESSP, a CPA atua de forma autônoma, com a participação de representantes de todos
                  os segmentos da comunidade acadêmica, garantindo uma visão ampla e plural da realidade
                  institucional.
                </p>
                <div
                  className="rounded-2xl p-5"
                  style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
                >
                  <p style={{ color: 'var(--brand-700)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    Para contato direto com a CPA, escreva para{' '}
                    <a href="mailto:cpa@ipessp.edu.br" style={{ fontWeight: 700, textDecoration: 'underline' }}>
                      cpa@ipessp.edu.br
                    </a>
                  </p>
                </div>
              </div>
              <div>
                <p style={{ color: 'var(--ink-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }} className="mb-4">
                  Composição da Comissão
                </p>
                <div className="flex flex-col gap-3">
                  {membros.map(m => (
                    <div
                      key={m.grupo}
                      className="rounded-xl p-5 flex items-start gap-4"
                      style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}
                      >
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div>
                        <h4 style={{ color: 'var(--ink-900)', fontWeight: 700, fontSize: '0.9375rem' }} className="mb-0.5">
                          {m.grupo}
                        </h4>
                        <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem' }}>{m.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Atribuições
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold"
              >
                Funções da CPA
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {funcoes.map(f => (
                <div
                  key={f.title}
                  className="rounded-2xl p-7"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                  >
                    {f.icon}
                  </div>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                    className="font-bold mb-2"
                  >
                    {f.title}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
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
                Relatórios de Autoavaliação
              </h2>
              <p style={{ color: 'var(--ink-500)', maxWidth: '520px' }} className="mx-auto">
                Os relatórios de autoavaliação institucional são elaborados anualmente pela CPA e
                encaminhados ao INEP/MEC.
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
                    <p style={{ color: 'var(--ink-500)', fontSize: '0.8125rem' }}>{r.periodo}</p>
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
