import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const services = [
  {
    title: 'Estética Facial',
    description: 'Tratamentos avançados supervisionados por especialistas para rejuvenescimento e harmonização.',
    items: [
      'Rugas e linhas de expressão',
      'Harmonização facial',
      'Toxina botulínica',
      'Bioestimuladores de colágeno',
      'Carboxiterapia',
      'Fios de PDO',
      'Mesoterapia',
      'Peelings químicos',
      'Preenchimento dérmico',
    ],
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M8 14s-4 1.5-4 5h16c0-3.5-4-5-4-5" />
      </svg>
    ),
  },
  {
    title: 'Estética Corporal',
    description: 'Protocolos corporais com tecnologia de ponta para resultados eficazes e seguros.',
    items: [
      'Gordura localizada',
      'Tratamento de celulite',
      'Radiofrequência corporal',
      'Drenagem linfática',
      'Massagem modeladora',
    ],
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 2a5 5 0 015 5v3a5 5 0 01-10 0V7a5 5 0 015-5z" />
        <path d="M4 22v-2a7 7 0 0114 0v2" />
      </svg>
    ),
  },
  {
    title: 'Acupuntura & PEIM',
    description: 'Técnicas de medicina integrativa aplicadas por profissionais qualificados com supervisão docente.',
    items: [
      'Acupuntura tradicional',
      'PEIM – Procedimentos Estéticos Integrativos',
      'Auriculoterapia',
      'Ventosaterapia',
      'Moxabustão',
    ],
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 2v20M2 12h20" />
        <circle cx="12" cy="12" r="5" />
      </svg>
    ),
  },
];

const steps = [
  {
    number: '01',
    title: 'Agendamento',
    description: 'Entre em contato pelo WhatsApp ou e-mail e agende sua consulta de avaliação gratuita.',
  },
  {
    number: '02',
    title: 'Avaliação',
    description: 'Nossa equipe realiza uma avaliação completa e personalizada para indicar o melhor protocolo.',
  },
  {
    number: '03',
    title: 'Atendimento',
    description: 'Os procedimentos são realizados por alunos supervisionados por mestres e doutores especialistas.',
  },
];

export default function ClinicaEscolaPage() {
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
              Clínica Escola IPESSP
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Espaço que integra práticas acadêmicas com atendimento à comunidade, com supervisão de
              mestres e doutores. Mais de 60% das atividades curriculares em prática real.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Sobre a Clínica
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                  className="font-bold mb-6"
                >
                  Excelência acadêmica aplicada à prática real
                </h2>
                <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }} className="mb-4">
                  A Clínica Escola da Faculdade IPESSP é um espaço único onde o conhecimento teórico se transforma em
                  atendimento de qualidade para a comunidade. Localizada na sede da faculdade, na Consolação, a clínica
                  oferece tratamentos estéticos, acupuntura e procedimentos integrativos a preços acessíveis.
                </p>
                <p style={{ color: 'var(--ink-700)', lineHeight: '1.7' }}>
                  Todo atendimento é realizado por alunos dos cursos de pós-graduação sob supervisão direta de
                  professores mestres e doutores, garantindo segurança, qualidade e resultado para os pacientes.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '60%+', label: 'Atividades em prática real' },
                  { value: 'MSc/PhD', label: 'Supervisão qualificada' },
                  { value: '3', label: 'Especialidades disponíveis' },
                  { value: '6 dias', label: 'Por semana aberto' },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-6 text-center"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                  >
                    <p
                      style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'var(--brand-600)' }}
                      className="font-bold mb-1"
                    >
                      {stat.value}
                    </p>
                    <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem' }}>{stat.label}</p>
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
                className="font-bold"
              >
                Tratamentos disponíveis
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {services.map(service => (
                <div
                  key={service.title}
                  className="rounded-2xl p-8"
                  style={{ background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                  >
                    {service.icon}
                  </div>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                    className="font-bold mb-3"
                  >
                    {service.title}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem' }} className="mb-5">
                    {service.description}
                  </p>
                  <ul className="space-y-2">
                    {service.items.map(item => (
                      <li key={item} className="flex items-start gap-2" style={{ color: 'var(--ink-700)', fontSize: '0.875rem' }}>
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
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Como Funciona
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold"
              >
                Em 3 passos simples
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.number} className="relative">
                  {i < steps.length - 1 && (
                    <div
                      className="hidden md:block absolute top-7 left-1/2 w-full h-px"
                      style={{ background: 'var(--line)' }}
                    />
                  )}
                  <div className="relative text-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 font-bold text-xl relative z-10"
                      style={{
                        background: 'var(--brand-600)',
                        color: 'white',
                        fontFamily: 'var(--font-display)',
                      }}
                    >
                      {step.number}
                    </div>
                    <h3
                      style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                      className="font-bold mb-3"
                    >
                      {step.title}
                    </h3>
                    <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem' }}>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--brand-900)' }}>
          <div className="container-site text-center">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Agende seu atendimento
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)' }}
              className="font-bold text-white mb-4"
            >
              Pronto para começar seu tratamento?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '520px' }} className="mx-auto mb-8">
              Entre em contato e agende sua avaliação gratuita. Nossa equipe está pronta para atendê-lo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5511976922127"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-white"
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Agendar pelo WhatsApp
              </a>
              <a href="mailto:marketing@ipessp.edu.br" className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
                Enviar e-mail
              </a>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" />
                  </svg>
                </div>
                <h3 style={{ color: 'var(--ink-900)', fontWeight: 700 }} className="mb-2">Telefone</h3>
                <a
                  href="tel:+5511976922127"
                  style={{ color: 'var(--ink-500)', fontSize: '0.9375rem' }}
                  className="hover:text-brand-600 transition-colors"
                >
                  (11) 97692-2127
                </a>
              </div>
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <h3 style={{ color: 'var(--ink-900)', fontWeight: 700 }} className="mb-2">E-mail</h3>
                <a
                  href="mailto:marketing@ipessp.edu.br"
                  style={{ color: 'var(--ink-500)', fontSize: '0.9375rem' }}
                >
                  marketing@ipessp.edu.br
                </a>
              </div>
              <div
                className="rounded-2xl p-8"
                style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                >
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                </div>
                <h3 style={{ color: 'var(--ink-900)', fontWeight: 700 }} className="mb-2">Endereço & Horários</h3>
                <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  Rua Dona Antônia de Queirós, 333<br />
                  Consolação, São Paulo/SP<br />
                  <br />
                  Seg–Qui: 8h–22h<br />
                  Sex: 8h–20h<br />
                  Sáb–Dom: 8h–17h
                </p>
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
