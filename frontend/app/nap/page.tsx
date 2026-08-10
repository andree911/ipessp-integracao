import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const servicos = [
  {
    title: 'Plantões Semanais',
    description:
      'Atendimento individual e/ou em grupo, realizado semanalmente, para escuta e acompanhamento de alunos e professores.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>
    ),
  },
  {
    title: 'Grupos Temáticos de Reflexão',
    description:
      'Encontros em grupo para discutir temas relevantes à vida acadêmica e ao desenvolvimento pessoal dos estudantes.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Atividades de Sensibilização',
    description:
      'Ações voltadas à comunidade acadêmica para promover acolhimento, bem-estar e conscientização sobre saúde emocional.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Procura Espontânea ou Encaminhamento',
    description:
      'O aluno pode procurar o NAP diretamente, ou ser encaminhado por coordenadores, professores ou pela CPA.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
];

const equipe = [
  { cargo: 'Profa. Izabel Ferraz Lima', descricao: 'Coordenadora do NAP. Graduação em Pedagogia e pós-graduação em Psicopedagogia com ênfase em Educação Especial.' },
];

export default function NapPage() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site text-white">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Apoio ao Aluno
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)' }}
              className="font-bold mb-4"
            >
              NAP – Núcleo de Apoio Psicopedagógico
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Suporte integral aos alunos com dificuldades de aprendizagem, orientação acadêmica
              e acompanhamento psicológico. Porque sua jornada importa além da sala de aula.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                  O que é o NAP
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                  className="font-bold mb-5"
                >
                  Suporte completo para o sucesso acadêmico
                </h2>
                <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }} className="mb-4">
                  O Núcleo de Apoio Psicopedagógico (NAP) do IPESSP foi criado para garantir que todos os
                  alunos tenham acesso a suporte especializado sempre que necessário. Entendemos que o
                  sucesso acadêmico não depende apenas do esforço individual, mas também do ambiente
                  e das condições oferecidas pela instituição.
                </p>
                <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }}>
                  O núcleo contribui para a excelência da qualidade do ensino, propiciando ao professor e
                  ao aluno um espaço de escuta e compartilhamento de dificuldades, com apoio emocional,
                  auxílio na elaboração de estratégias pedagógicas e orientação vocacional.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                {equipe.map(membro => (
                  <div
                    key={membro.cargo}
                    className="rounded-2xl p-6 flex items-start gap-4"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                    >
                      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <div>
                      <h4 style={{ color: 'var(--ink-900)', fontWeight: 700 }} className="mb-1">
                        {membro.cargo}
                      </h4>
                      <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem', lineHeight: '1.5' }}>
                        {membro.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Serviços
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold mb-4"
              >
                O que o NAP oferece
              </h2>
              <p style={{ color: 'var(--ink-500)', maxWidth: '540px' }} className="mx-auto">
                Nossos serviços são gratuitos, sigilosos e voltados exclusivamente para o bem-estar
                e o desenvolvimento dos alunos IPESSP.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {servicos.map(servico => (
                <div
                  key={servico.title}
                  className="rounded-2xl p-7"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                  >
                    {servico.icon}
                  </div>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                    className="font-bold mb-2"
                  >
                    {servico.title}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    {servico.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="max-w-3xl mx-auto">
              <div
                className="rounded-2xl p-8 md:p-12"
                style={{ background: 'var(--brand-900)' }}
              >
                <div className="text-center mb-8">
                  <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                    Atendimento
                  </p>
                  <h2
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)' }}
                    className="font-bold text-white mb-3"
                  >
                    Como agendar seu atendimento
                  </h2>
                  <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Os atendimentos do NAP são realizados mediante agendamento prévio.
                    Entre em contato por um dos canais abaixo.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/5511998917111"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-white justify-center"
                  >
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp: (11) 99891-7111
                  </a>
                  <a
                    href="mailto:psicopedagogico@ipessp.edu.br"
                    className="btn justify-center"
                    style={{ background: 'rgba(255,255,255,0.12)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                  >
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    psicopedagogico@ipessp.edu.br
                  </a>
                </div>
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
