import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const categorias = [
  {
    categoria: 'Hospitais e Redes de Saúde',
    parceiros: [
      { nome: 'Hospital Nove de Julho', iniciais: 'H9J', desc: 'Parceria para atividades práticas e estágios clínicos.' },
      { nome: 'HCor', iniciais: 'HC', desc: 'Hospital do Coração — referência em cardiologia no Brasil.' },
      { nome: 'Rede D\'Or', iniciais: 'RD', desc: 'Maior rede de hospitais do Brasil para estágios.' },
      { nome: 'Hospital Beneficência Portuguesa', iniciais: 'HBP', desc: 'Parceria para estágios em diversas especialidades.' },
      { nome: 'Hospital do Mandaqui', iniciais: 'HM', desc: 'Campo de estágio em saúde pública e atenção hospitalar.' },
    ],
  },
  {
    categoria: 'Laboratórios e Diagnóstico',
    parceiros: [
      { nome: 'Colsan', iniciais: 'COL', desc: 'Banco de sangue referência para hemoterapia e análises clínicas.' },
      { nome: 'LGC Bio', iniciais: 'LGC', desc: 'Serviços laboratoriais de excelência e parceria científica.' },
      { nome: 'DiagClin Vet', iniciais: 'DCV', desc: 'Diagnóstico veterinário — parceiro em análises clínicas animais.' },
    ],
  },
  {
    categoria: 'Entidades e Conselhos',
    parceiros: [
      { nome: 'SPDM', iniciais: 'SPD', desc: 'Associação Paulista para o Desenvolvimento da Medicina.' },
      { nome: 'Associação Sabesp', iniciais: 'SAB', desc: 'Parceria para saúde ocupacional e bem-estar dos colaboradores.' },
      { nome: 'Confenen', iniciais: 'CFN', desc: 'Confederação Nacional dos Estabelecimentos de Ensino de Enfermagem.' },
      { nome: 'CRF-SP', iniciais: 'CRF', desc: 'Conselho Regional de Farmácia — reconhecimento dos cursos na área.' },
      { nome: 'SBCEC', iniciais: 'SBC', desc: 'Sociedade Brasileira de Circulação Extracorpórea.' },
    ],
  },
  {
    categoria: 'Tecnologia e Equipamentos',
    parceiros: [
      { nome: 'Braile Biomédica', iniciais: 'BB', desc: 'Fabricante de equipamentos médicos de alta tecnologia.' },
      { nome: 'LivaNova / Sorin Group', iniciais: 'LN', desc: 'Líder mundial em dispositivos cardíacos e perfusão.' },
    ],
  },
  {
    categoria: 'Educação',
    parceiros: [
      { nome: 'Universidade Metodista', iniciais: 'UM', desc: 'Parceria acadêmica para reconhecimento e cooperação de cursos.' },
      { nome: 'FMUSP / ICESP', iniciais: 'FM', desc: 'Parceria estratégica para o curso de Farmácia Oncológica com estágio presencial.' },
    ],
  },
];

export default function Parceiros() {
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
              Nossos Parceiros
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Construímos parcerias sólidas com as principais instituições de saúde, laboratórios e entidades do país para garantir a melhor formação prática aos nossos alunos.
            </p>
          </div>
        </section>

        <style>{`
          .parceiro-card:hover {
            box-shadow: var(--shadow-md);
            transform: translateY(-2px);
          }
        `}</style>
        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ maxWidth: '700px', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Rede de excelência
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '16px' }}>
                Parceiros que fortalecem sua formação
              </h2>
              <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)' }}>
                O IPESSP mantém convênios e parcerias com hospitais, laboratórios, conselhos profissionais e empresas de tecnologia médica. Essas conexões traduzem-se em campos de estágio, aulas práticas, equipamentos de ponta e reconhecimento profissional para nossos alunos.
              </p>
            </div>

            {categorias.map((cat) => (
              <div key={cat.categoria} style={{ marginBottom: 'clamp(40px,5vw,64px)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                  <div style={{ width: '4px', height: '28px', background: 'var(--brand-600)', borderRadius: '2px' }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {cat.categoria}
                  </h3>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '18px' }}>
                  {cat.parceiros.map((p) => (
                    <div
                      key={p.nome}
                      className="parceiro-card"
                      style={{
                        background: 'var(--surface-alt)',
                        borderRadius: 'var(--radius-md)',
                        padding: '24px',
                        border: '1px solid var(--line)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '16px',
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                    >
                      <div style={{ width: '52px', height: '52px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.7rem', letterSpacing: '0.04em', flexShrink: 0 }}>
                        {p.iniciais}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', marginBottom: '6px', fontFamily: 'var(--font-display)' }}>
                          {p.nome}
                        </p>
                        <p style={{ color: 'var(--ink-500)', fontSize: '0.825rem', lineHeight: 'var(--lh-body)' }}>
                          {p.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '24px' }}>
            <p style={{ color: 'var(--accent-400)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)' }}>
              Seja um parceiro
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', maxWidth: '600px' }}>
              Sua instituição pode fazer parte da nossa rede
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', maxWidth: '520px' }}>
              Se você representa um hospital, laboratório, clínica ou entidade da área da saúde e deseja estabelecer uma parceria com o IPESSP, entre em contato com nossa equipe.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', justifyContent: 'center' }}>
              <a href="https://wa.me/5511976922127" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Falar pelo WhatsApp
              </a>
              <a href="mailto:marketing@ipessp.edu.br" className="btn btn-white">
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
