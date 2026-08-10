import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const labs = [
  {
    name: 'Análises Clínicas',
    description:
      'Laboratório voltado para o desenvolvimento de habilidades em hematologia, bioquímica, microbiologia e parasitologia clínica. Os alunos realizam desde coleta até interpretação de laudos em condições reais de atendimento.',
    capacity: '24 alunos por turma',
    equipments: [
      'Analisador hematológico automatizado',
      'Centrífugas de alta velocidade',
      'Espectrofotômetros UV-Vis',
      'Microscópios binoculares de alta resolução',
      'Cabines de segurança biológica classe II',
      'Autoclave vertical 100L',
      'Coagulômetro semiautomatizado',
    ],
  },
  {
    name: 'Estética e Cosmética',
    description:
      'Ambiente equipado para prática de protocolos faciais e corporais. Integra a formação dos cursos de Estética e Cosmética e pós-graduações em biomedicina e farmácia estética avançada.',
    capacity: '16 alunos por turma',
    equipments: [
      'Aparelhos de radiofrequência multipolar',
      'Equipamento de ultrassom focalizado',
      'Plataformas de fototerapia LED',
      'Mesas elétricas de estética',
      'Aparelhos de corrente galvânica e microcorrente',
      'Sistema de carboxiterapia',
      'Equipamentos de laser fracionado',
    ],
  },
  {
    name: 'Biomedicina',
    description:
      'Espaço dedicado a práticas de biologia molecular, genética, citologia e imunologia. Suporta as disciplinas do curso de graduação em Biomedicina e pós-graduações correlatas.',
    capacity: '20 alunos por turma',
    equipments: [
      'Termocicladores para PCR',
      'Transiluminador UV e sistema de documentação',
      'Câmaras de eletroforese horizontal e vertical',
      'Microscópios de fluorescência',
      'Banho-maria digital com circulação',
      'Centrífugas refrigeradas',
      'Capelas de fluxo laminar',
    ],
  },
  {
    name: 'Farmácia',
    description:
      'Laboratório de farmacotécnica e controle de qualidade para alunos de pós-graduação em farmácia clínica, oncológica e estética. Inclui área estéril para manipulação de fórmulas.',
    capacity: '18 alunos por turma',
    equipments: [
      'Câmara de fluxo laminar vertical (área estéril)',
      'Balanças analíticas de precisão',
      'pHmetro digital de bancada',
      'Reômetro de formulações semissólidas',
      'Estufa de esterilização e secagem',
      'Agitadores magnéticos com aquecimento',
      'Sistema HPLC compacto',
    ],
  },
  {
    name: 'Laboratório Multidisciplinar',
    description:
      'Espaço flexível compartilhado entre diferentes cursos, voltado a aulas práticas integradas, workshops, simulações clínicas e atividades de pesquisa aplicada.',
    capacity: '30 alunos por turma',
    equipments: [
      'Bancadas modulares reconfiguráveis',
      'Projetor de alta resolução integrado',
      'Manequins anatômicos e simuladores clínicos',
      'Estações de computador para análise de dados',
      'Microscópios compartilhados',
      'Armários individuais com controle de acesso',
      'Sistema de vídeo para transmissão de aulas práticas',
    ],
  },
];

const infra = [
  { value: '4.000m²', label: 'Área total da sede' },
  { value: '2', label: 'Anfiteatros' },
  { value: '10', label: 'Salas de aula' },
  { value: '5', label: 'Laboratórios especializados' },
  { value: '1', label: 'Biblioteca física' },
  { value: '1', label: 'Clínica Escola' },
];

export default function LaboratoriosPage() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site text-white">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Infraestrutura
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)' }}
              className="font-bold mb-4"
            >
              Laboratórios IPESSP
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Cinco laboratórios totalmente equipados na sede de 4.000m² no bairro da Consolação,
              em São Paulo. Infraestrutura pensada para garantir aprendizado prático de excelência.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="text-center mb-14">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Infraestrutura Geral
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold mb-4"
              >
                Nossa estrutura em números
              </h2>
              <p style={{ color: 'var(--ink-500)', maxWidth: '560px' }} className="mx-auto">
                Localizada na Rua Dona Antônia de Queirós, 333, Consolação, a sede do IPESSP
                foi projetada para oferecer o melhor ambiente de aprendizagem em saúde.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {infra.map(item => (
                <div
                  key={item.label}
                  className="rounded-2xl p-6 text-center"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                >
                  <p
                    style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--brand-600)' }}
                    className="font-bold mb-1"
                  >
                    {item.value}
                  </p>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.8125rem', lineHeight: '1.4' }}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div className="text-center mb-14">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Laboratórios
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold"
              >
                Conheça cada espaço
              </h2>
            </div>
            <div className="flex flex-col gap-8">
              {labs.map((lab, i) => (
                <div
                  key={lab.name}
                  className="rounded-2xl p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                        style={{
                          background: 'var(--brand-600)',
                          color: 'white',
                          fontFamily: 'var(--font-display)',
                        }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </div>
                      <h3
                        style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                        className="font-bold"
                      >
                        {lab.name}
                      </h3>
                    </div>
                    <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }} className="mb-4">
                      {lab.description}
                    </p>
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium"
                      style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                      </svg>
                      {lab.capacity}
                    </div>
                  </div>
                  <div>
                    <p
                      style={{ color: 'var(--ink-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}
                      className="mb-3"
                    >
                      Equipamentos principais
                    </p>
                    <ul className="space-y-2">
                      {lab.equipments.map(eq => (
                        <li
                          key={eq}
                          className="flex items-start gap-2"
                          style={{ color: 'var(--ink-700)', fontSize: '0.9375rem' }}
                        >
                          <svg
                            width="14"
                            height="14"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            viewBox="0 0 24 24"
                            className="mt-0.5 flex-shrink-0"
                            style={{ color: 'var(--brand-600)' }}
                          >
                            <path d="M20 6 9 17l-5-5" />
                          </svg>
                          {eq}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--brand-900)' }}>
          <div className="container-site text-center">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Venha conhecer
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)' }}
              className="font-bold text-white mb-4"
            >
              Agende uma visita à nossa sede
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '520px' }} className="mx-auto mb-8">
              Conheça pessoalmente nossa infraestrutura e descubra como o IPESSP pode transformar
              sua carreira na área da saúde.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5511998917111"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-white"
              >
                Agendar visita pelo WhatsApp
              </a>
              <a href="mailto:marketing@ipessp.edu.br" className="btn" style={{ background: 'transparent', border: '2px solid rgba(255,255,255,0.4)', color: 'white' }}>
                Enviar e-mail
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
