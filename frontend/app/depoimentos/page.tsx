import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const depoimentos = [
  {
    nome: 'Valeska Silveira',
    curso: 'Pós-Graduação em Hematologia, Hemoterapia e Biologia Molecular',
    atuacao: 'Especialista em Biologia Molecular',
    texto: 'Fiz cursos de Atualização, Capacitação e duas Pós-graduações em Hematologia e Hemoterapia e Biologia Molecular que me ajudaram a conseguir uma colocação profissional e a prestar um bom serviço à sociedade.',
    iniciais: 'VS',
    cor: '#9b1c1c',
    estrelas: 5,
  },
  {
    nome: 'Sheila Menegati',
    curso: 'Pós-Graduação em Hematologia Laboratorial e Hemoterapia',
    atuacao: 'Docente no CEUNSP — Itu/SP',
    texto: 'Após me tornar especialista em Hematologia Laboratorial e Hemoterapia pelo IPESSP, fui convidada a ser docente no CEUNSP, em Itu. O IPESSP abriu portas que eu não imaginava que existiam para minha carreira.',
    iniciais: 'SM',
    cor: '#7d1717',
    estrelas: 5,
  },
  {
    nome: 'Andressa Germano',
    curso: 'Pós-Graduação em Citologia Clínica',
    atuacao: 'Histotécnica — Hospital Brigadeiro',
    texto: 'Tornei-me especialista em Citologia Clínica com ênfase em citologia cérvico-vaginal pelo IPESSP e atualmente sou Histotécnica no Hospital Brigadeiro. A formação prática foi absolutamente fundamental.',
    iniciais: 'AG',
    cor: '#5c1111',
    estrelas: 5,
  },
  {
    nome: 'Karen Nogueira',
    curso: 'Pós-Graduação em Hematologia e Hemoterapia Laboratorial',
    atuacao: 'Docente — IPESSP e outras instituições',
    texto: 'Tornei-me especialista em Hematologia e Hemoterapia Laboratorial pelo IPESSP e atualmente sou docente no próprio IPESSP e também em outras instituições. O curso mudou completamente minha trajetória profissional.',
    iniciais: 'KN',
    cor: '#9b1c1c',
    estrelas: 5,
  },
  {
    nome: 'Fernanda Rocha',
    curso: 'Pós-Graduação em Biomedicina Estética Avançada',
    atuacao: 'Proprietária de Clínica Estética — SP',
    texto: 'O curso de Biomedicina Estética Avançada me deu a base científica e prática que eu precisava para abrir minha própria clínica. Os professores têm vivência real de mercado e isso faz toda a diferença na formação.',
    iniciais: 'FR',
    cor: '#7d1717',
    estrelas: 5,
  },
  {
    nome: 'Rodrigo Mendes',
    curso: 'Pós-Graduação em Farmácia Clínica e Atenção Farmacêutica',
    atuacao: 'Farmacêutico Clínico — Hospital Albert Einstein',
    texto: 'A pós-graduação em Farmácia Clínica do IPESSP me preparou de forma excepcional. O formato EAD com práticas presenciais é ideal para quem já trabalha. Hoje atuo no Einstein e recomendo o curso para todos os farmacêuticos.',
    iniciais: 'RM',
    cor: '#5c1111',
    estrelas: 5,
  },
  {
    nome: 'Patricia Almeida',
    curso: 'Pós-Graduação em Enfermagem Intensiva Adulto',
    atuacao: 'Enfermeira UTI — Hospital São Paulo',
    texto: 'A especialização em Enfermagem Intensiva do IPESSP transformou minha prática clínica. Aprendi protocolos atualizados e técnicas avançadas de cuidados críticos que aplico diariamente na UTI. Formação de altíssimo nível.',
    iniciais: 'PA',
    cor: '#9b1c1c',
    estrelas: 5,
  },
  {
    nome: 'Marcelo Tavares',
    curso: 'Pós-Graduação em Administração Hospitalar',
    atuacao: 'Gestor de Saúde — Unidade Amil SP',
    texto: 'O MBA em Administração Hospitalar do IPESSP combina teoria sólida com aplicação prática nos desafios reais da gestão em saúde. Foi determinante para minha promoção ao cargo de gestor. Estrutura acadêmica muito bem organizada.',
    iniciais: 'MT',
    cor: '#7d1717',
    estrelas: 5,
  },
  {
    nome: 'Juliana Castro',
    curso: 'Pós-Graduação em Gerontologia',
    atuacao: 'Gerontóloga — Residência Sênior Morumbi',
    texto: 'Escolhi o IPESSP para minha especialização em Gerontologia pela reputação dos professores e pelo currículo completo. O formato EAD de 40% permitiu conciliar com o trabalho. Hoje tenho mais segurança e conhecimento para cuidar dos meus pacientes idosos.',
    iniciais: 'JC',
    cor: '#5c1111',
    estrelas: 5,
  },
];

const stats = [
  { numero: '5.000+', label: 'Profissionais formados' },
  { numero: '25', label: 'Anos de excelência' },
  { numero: '54', label: 'Cursos disponíveis' },
  { numero: '5★', label: 'Avaliação média' },
];

export default function Depoimentos() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Quem já estudou aqui
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Depoimentos
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '560px', lineHeight: 'var(--lh-body)' }}>
              Mais de 5.000 profissionais de saúde já transformaram suas carreiras através dos cursos do IPESSP. Veja o que eles dizem.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
              {depoimentos.map((d) => (
                <div
                  key={d.nome}
                  style={{
                    background: 'var(--surface)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-400)' }}>
                      <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                      </svg>
                    </div>
                    <div style={{ display: 'flex', gap: '3px' }}>
                      {Array.from({ length: d.estrelas }).map((_, i) => (
                        <svg key={i} width="15" height="15" fill="var(--accent-400)" viewBox="0 0 24 24">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                        </svg>
                      ))}
                    </div>
                  </div>

                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', fontStyle: 'italic', flex: 1 }}>
                    &ldquo;{d.texto}&rdquo;
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: d.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                      {d.iniciais}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', fontFamily: 'var(--font-display)' }}>
                        {d.nome}
                      </p>
                      <p style={{ color: 'var(--brand-600)', fontSize: '0.8rem', fontWeight: 600, marginTop: '2px' }}>
                        {d.atuacao}
                      </p>
                      <p style={{ color: 'var(--ink-500)', fontSize: '0.775rem', marginTop: '2px' }}>
                        {d.curso}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px', marginBottom: 'clamp(48px,5vw,64px)' }}>
              {stats.map((s) => (
                <div key={s.label} style={{ textAlign: 'center', padding: '28px 16px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,4vw,2.8rem)', fontWeight: 800, color: 'var(--accent-400)', lineHeight: 1, marginBottom: '8px' }}>
                    {s.numero}
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 'var(--fs-sm)', fontWeight: 500 }}>
                    {s.label}
                  </p>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
                Faça parte dessa história
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', maxWidth: '480px', margin: '0 auto 28px' }}>
                Escolha o seu curso e inicie sua especialização com quem mais formou profissionais de saúde em São Paulo.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
                <a href="/#pre-inscricao" className="btn btn-primary">
                  Matricule-se agora
                </a>
                <a href="https://wa.me/5511976922127" target="_blank" rel="noopener noreferrer" className="btn btn-white">
                  Falar com consultor
                </a>
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
