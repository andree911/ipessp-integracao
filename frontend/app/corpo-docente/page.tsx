import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const professores = [
  {
    iniciais: 'MCF',
    cor: '#9b1c1c',
    nome: 'Prof. Dr. Marcos Carvalho Ferreira',
    titulacao: 'Doutor',
    area: 'Análises Clínicas',
    especializacao: 'Hematologia e Hemoterapia Laboratorial',
  },
  {
    iniciais: 'RAB',
    cor: '#7d1717',
    nome: 'Profa. Dra. Renata Alves Borges',
    titulacao: 'Doutora',
    area: 'Análises Clínicas',
    especializacao: 'Microbiologia Clínica e Biologia Molecular',
  },
  {
    iniciais: 'FSL',
    cor: '#5c1111',
    nome: 'Prof. Dr. Fernando Silva Lima',
    titulacao: 'Doutor',
    area: 'Cardiologia',
    especializacao: 'Circulação Extracorpórea e Perfusão',
  },
  {
    iniciais: 'APC',
    cor: '#9b1c1c',
    nome: 'Profa. Msa. Ana Paula Costa',
    titulacao: 'Mestre',
    area: 'Estética',
    especializacao: 'Biomedicina Estética e Harmonização Facial',
  },
  {
    iniciais: 'VTM',
    cor: '#7d1717',
    nome: 'Profa. Dra. Viviane Torres Mello',
    titulacao: 'Doutora',
    area: 'Estética',
    especializacao: 'Farmácia Estética Avançada e Cosmetologia',
  },
  {
    iniciais: 'JRO',
    cor: '#5c1111',
    nome: 'Prof. Ms. José Roberto Oliveira',
    titulacao: 'Mestre',
    area: 'Enfermagem',
    especializacao: 'Enfermagem Intensiva Adulto e Pediátrica',
  },
  {
    iniciais: 'CBN',
    cor: '#9b1c1c',
    nome: 'Profa. Dra. Cristina Barbosa Nunes',
    titulacao: 'Doutora',
    area: 'Enfermagem',
    especializacao: 'Neonatologia e Enfermagem Intensiva Neonatal',
  },
  {
    iniciais: 'LSP',
    cor: '#7d1717',
    nome: 'Prof. Dr. Luiz Sérgio Pinto',
    titulacao: 'Doutor',
    area: 'Farmácia',
    especializacao: 'Farmácia Oncológica e Atenção Farmacêutica',
  },
  {
    iniciais: 'MRS',
    cor: '#5c1111',
    nome: 'Profa. Msa. Mariana Rezende Santos',
    titulacao: 'Mestre',
    area: 'Farmácia',
    especializacao: 'Farmácia Clínica e Serviços Farmacêuticos',
  },
  {
    iniciais: 'PAM',
    cor: '#9b1c1c',
    nome: 'Prof. Dr. Paulo André Macedo',
    titulacao: 'Doutor',
    area: 'Gestão em Saúde',
    especializacao: 'Administração Hospitalar e Auditoria em Saúde',
  },
  {
    iniciais: 'TLG',
    cor: '#7d1717',
    nome: 'Profa. Msa. Tatiana Lopes Guimarães',
    titulacao: 'Mestre',
    area: 'Gestão em Saúde',
    especializacao: 'Saúde Pública e Estratégia de Saúde da Família',
  },
  {
    iniciais: 'ECV',
    cor: '#5c1111',
    nome: 'Prof. Dr. Eduardo Castro Viana',
    titulacao: 'Doutor',
    area: 'Análises Clínicas',
    especializacao: 'Citologia Clínica e Citogenética',
  },
];

const areas = ['Análises Clínicas', 'Cardiologia', 'Estética', 'Enfermagem', 'Farmácia', 'Gestão em Saúde'];

export default function CorpoDocente() {
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
              Corpo Docente
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Professores mestres e doutores com sólida experiência clínica e acadêmica, prontos para preparar você para o mercado de trabalho.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,5vw,80px)', alignItems: 'center', marginBottom: 'clamp(56px,7vw,88px)' }} className="intro-grid">
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '12px' }}>
                  Excelência no ensino
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '20px' }}>
                  Professores que fazem a diferença
                </h2>
                <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', marginBottom: '16px' }}>
                  Nosso corpo docente é formado por mestres e doutores titulados nas melhores universidades do país, com atuação ativa no mercado de saúde. Essa combinação de rigor acadêmico e vivência prática é o que torna o ensino do IPESSP único.
                </p>
                <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)' }}>
                  Cada professor é selecionado não apenas pela titulação, mas pelo compromisso com uma educação transformadora, ética e orientada para os desafios reais da prática profissional em saúde.
                </p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { numero: '100%', label: 'Mestres e Doutores' },
                  { numero: '25+', label: 'Anos de experiência média' },
                  { numero: '6', label: 'Áreas de especialização' },
                  { numero: '54', label: 'Cursos com corpo docente próprio' },
                ].map((s) => (
                  <div key={s.label} style={{ background: 'var(--brand-50)', borderRadius: 'var(--radius-md)', padding: '24px 20px', textAlign: 'center', border: '1px solid var(--brand-100)' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: 'var(--brand-600)', lineHeight: 1, marginBottom: '8px' }}>
                      {s.numero}
                    </p>
                    <p style={{ color: 'var(--ink-700)', fontSize: '0.8rem', fontWeight: 500 }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <style>{`
              @media (max-width: 768px) {
                .intro-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
              {areas.map((area) => (
                <span key={area} style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', borderRadius: 'var(--radius-pill)', padding: '6px 16px', fontSize: 'var(--fs-sm)', color: 'var(--ink-700)', fontWeight: 500 }}>
                  {area}
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {professores.map((p) => (
                <div
                  key={p.nome}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '28px 24px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: '14px',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-md)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = ''; (e.currentTarget as HTMLDivElement).style.transform = ''; }}
                >
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: p.cor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.04em', flexShrink: 0, border: '3px solid var(--surface)' }}>
                    {p.iniciais}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', marginBottom: '6px' }}>
                      {p.nome}
                    </p>
                    <span style={{ display: 'inline-block', background: p.titulacao === 'Doutor' || p.titulacao === 'Doutora' ? 'var(--brand-600)' : 'var(--brand-300)', color: 'white', borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600, marginBottom: '8px' }}>
                      {p.titulacao}
                    </span>
                    <p style={{ color: 'var(--brand-700)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '4px' }}>
                      {p.area}
                    </p>
                    <p style={{ color: 'var(--ink-500)', fontSize: '0.775rem', lineHeight: 'var(--lh-body)' }}>
                      {p.especializacao}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="28" height="28" fill="none" stroke="var(--accent-400)" strokeWidth="1.8" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', maxWidth: '560px' }}>
              Faça parte do nosso time
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', maxWidth: '480px' }}>
              O IPESSP busca continuamente profissionais com titulação de mestre ou doutor e experiência prática nas ciências da saúde para integrar nosso corpo docente.
            </p>
            <a href="/trabalhe-conosco" className="btn btn-primary" style={{ marginTop: '8px' }}>
              Ver vagas disponíveis
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
