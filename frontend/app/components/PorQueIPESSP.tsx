/* Dados reais extraídos do site ipessp.edu.br */

const stats = [
  { value: '25+', label: 'Anos de mercado' },
  { value: '5.000+', label: 'Especialistas formados' },
  { value: '54', label: 'Cursos disponíveis' },
  { value: '4.000m²', label: 'Nova sede – Consolação' },
];

const parceiros = [
  'HCor', 'Rede D\'Or', 'Beneficência Portuguesa', 'Hospital Mandaqui',
  'Interlagos', 'Rede Sepaco', 'Sabarà', 'Hospital 9 de Julho',
  'ABBM', 'Braile Biomédica', 'Colsan', 'SPDM',
  'LGC Bio', 'SBCEC', 'Sorin Group / LivaNova', 'Universidade Metodista',
];

const diferenciais = [
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Parcerias para Estágios',
    text: 'O IPESSP possui convênios com os maiores hospitais e laboratórios de São Paulo — HCor, Beneficência Portuguesa, Rede D\'Or, Mandaqui, Interlagos, Rede Sepaco, Sabarà, Hospital 9 de Julho e muito mais.',
    tags: ['HCor', 'Rede D\'Or', 'Beneficência Portuguesa', 'FMUSP'],
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
      </svg>
    ),
    title: 'Infraestrutura Completa',
    text: '4.000 m² na Consolação com 5 laboratórios equipados, 2 anfiteatros e 10 salas de aula. Ensino 100% individualizado com equipamentos modernos para prática real desde o primeiro módulo.',
    tags: ['5 laboratórios', '2 anfiteatros', 'Clínica Escola'],
  },
  {
    icon: (
      <svg width="28" height="28" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 14l9-5-9-5-9 5 9 5z"/>
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/>
      </svg>
    ),
    title: 'Corpo Docente de Elite',
    text: 'Todo o nosso corpo docente é formado por mestres e doutores graduados e respeitados, com experiência clínica e acadêmica. Professores que atuam nos maiores hospitais e instituições de pesquisa do Brasil.',
    tags: ['Mestres e Doutores', 'Experiência clínica', 'Pesquisa ativa'],
  },
];

export default function PorQueIPESSP() {
  return (
    <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
      <div className="container-site">

        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--brand-500)' }}>
            Nossos Diferenciais
          </p>
          <h2 className="font-bold mb-4"
            style={{
              fontFamily: 'var(--font-sora, var(--font-display))',
              fontSize: 'var(--fs-h1)',
              color: 'var(--ink-900)',
            }}>
            Por que estudar no IPESSP?
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: 'var(--ink-500)' }}>
            Fundado em 2000 por médicos e biologistas, o IPESSP já formou mais de 5.000 profissionais
            de saúde com infraestrutura, parcerias e corpo docente que fazem a diferença na sua carreira.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {stats.map(s => (
            <div
              key={s.label}
              className="text-center py-6 px-4 rounded-2xl"
              style={{ background: 'var(--brand-600)' }}
            >
              <p
                className="font-bold mb-1"
                style={{
                  fontFamily: 'var(--font-sora)',
                  fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
                  color: '#fff',
                  lineHeight: 1,
                }}
              >
                {s.value}
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Cards de diferenciais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {diferenciais.map(d => (
            <div
              key={d.title}
              className="bg-white flex flex-col gap-5 p-8 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ boxShadow: 'var(--shadow-md)', border: '1px solid var(--line)' }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, var(--brand-500), var(--brand-700))' }}
              >
                {d.icon}
              </div>
              <div>
                <h3 className="font-bold mb-3"
                  style={{
                    fontFamily: 'var(--font-sora, var(--font-display))',
                    fontSize: 'var(--fs-h3)',
                    color: 'var(--ink-900)',
                  }}>
                  {d.title}
                </h3>
                <p className="leading-relaxed mb-4"
                  style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)' }}>
                  {d.text}
                </p>
                <div className="flex flex-wrap gap-2">
                  {d.tags.map(t => (
                    <span key={t} className="text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Parceiros */}
        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--surface)', border: '1px solid var(--line)' }}
        >
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-6"
            style={{ color: 'var(--ink-500)' }}>
            Parceiros que fazem a diferença no aprendizado dos nossos alunos
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {parceiros.map(p => (
              <span
                key={p}
                className="px-4 py-2 rounded-full text-sm font-medium border"
                style={{
                  borderColor: 'var(--line)',
                  color: 'var(--ink-700)',
                  background: 'var(--surface-alt)',
                }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a href="#pre-inscricao" className="btn btn-primary text-base px-8 py-4">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"/>
            </svg>
            Quero ser aluno IPESSP
          </a>
        </div>
      </div>
    </section>
  );
}
