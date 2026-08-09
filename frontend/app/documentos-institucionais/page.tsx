import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { FONE_DISPLAY, FONE_TEL, WHATSAPP_URL, EMAIL_CONTATO, EMAIL_HREF } from '@/lib/contato';

const categorias = [
  {
    titulo: 'Regimento Interno',
    descricao: 'Normas que regem o funcionamento acadêmico e administrativo da Faculdade IPESSP.',
    documentos: [
      { nome: 'Regimento Interno Geral – 2024', tamanho: '2,4 MB' },
      { nome: 'Regulamento Acadêmico dos Alunos', tamanho: '1,8 MB' },
      { nome: 'Normas para Estágio Curricular', tamanho: '980 KB' },
    ],
  },
  {
    titulo: 'PDI – Plano de Desenvolvimento Institucional',
    descricao: 'Documento que apresenta a missão, visão, metas e estratégias institucionais para o período vigente.',
    documentos: [
      { nome: 'PDI 2023–2027', tamanho: '4,2 MB' },
      { nome: 'PDI 2018–2022 (Referência)', tamanho: '3,7 MB' },
    ],
  },
  {
    titulo: 'PPI – Projeto Pedagógico Institucional',
    descricao: 'Diretrizes pedagógicas que norteiam todos os cursos e projetos de ensino da instituição.',
    documentos: [
      { nome: 'PPI – Versão Atualizada 2024', tamanho: '2,1 MB' },
    ],
  },
  {
    titulo: 'Atas de Reunião',
    descricao: 'Registros das deliberações dos órgãos colegiados: Colegiado de Curso, NDE e Conselho Superior.',
    documentos: [
      { nome: 'Atas do Colegiado de Curso – 2024', tamanho: '1,2 MB' },
      { nome: 'Atas do NDE – 2024', tamanho: '890 KB' },
      { nome: 'Atas do Conselho Superior – 2024', tamanho: '1,4 MB' },
    ],
  },
  {
    titulo: 'Portarias MEC',
    descricao: 'Atos normativos do Ministério da Educação relativos ao credenciamento e autorização dos cursos.',
    documentos: [
      { nome: 'Despacho MEC nº 1272 – Credenciamento (4 jul. 2019)', tamanho: '320 KB' },
      { nome: 'Portaria de Autorização – Estética e Cosmética', tamanho: '280 KB' },
      { nome: 'Portaria de Autorização – Biomedicina', tamanho: '275 KB' },
      { nome: 'Portaria de Autorização – Gestão Hospitalar', tamanho: '290 KB' },
    ],
  },
  {
    titulo: 'Relatórios CPA',
    descricao: 'Relatórios anuais de autoavaliação institucional elaborados pela Comissão Própria de Avaliação.',
    documentos: [
      { nome: 'Relatório CPA 2024', tamanho: '3,1 MB' },
      { nome: 'Relatório CPA 2023', tamanho: '2,9 MB' },
      { nome: 'Relatório CPA 2022', tamanho: '2,7 MB' },
    ],
  },
  {
    titulo: 'Planos de Curso',
    descricao: 'Projetos pedagógicos de cada curso oferecido, com objetivos, competências e ementas disciplinares.',
    documentos: [
      { nome: 'PPC – Estética e Cosmética', tamanho: '5,2 MB' },
      { nome: 'PPC – Biomedicina', tamanho: '4,8 MB' },
      { nome: 'PPC – Gestão Hospitalar', tamanho: '4,3 MB' },
      { nome: 'PPC – Fisioterapia', tamanho: '5,5 MB' },
    ],
  },
];

function PdfIcon() {
  return (
    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--brand-600)', flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9 15h6M9 11h3" />
    </svg>
  );
}

export default function DocumentosInstitucionaisPage() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site text-white">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Transparência Institucional
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)' }}
              className="font-bold mb-4"
            >
              Documentos Institucionais
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Acesse os regulamentos, planos e relatórios oficiais da Faculdade IPESSP.
              Transparência e prestação de contas à comunidade acadêmica e à sociedade.
            </p>
          </div>
        </section>

        <style>{`
          .documento-row:hover { background: var(--surface-alt) !important; }
        `}</style>
        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div
              className="rounded-2xl p-6 mb-12 flex items-start gap-4"
              style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--brand-100)', color: 'var(--brand-700)' }}
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div>
                <h3 style={{ color: 'var(--brand-800)', fontWeight: 700, fontSize: '0.9375rem' }} className="mb-1">
                  Acesso a documentos específicos
                </h3>
                <p style={{ color: 'var(--brand-700)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                  Para acesso a documentos específicos ou versões anteriores, entre em contato com a secretaria pelo e-mail{' '}
                  <a href={EMAIL_HREF} style={{ fontWeight: 700, textDecoration: 'underline' }}>
                    {EMAIL_CONTATO}
                  </a>{' '}
                  ou pelo telefone{' '}
                  <a href={FONE_TEL} style={{ fontWeight: 700, textDecoration: 'underline' }}>
                    {FONE_DISPLAY}
                  </a>
                  .
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {categorias.map(cat => (
                <div
                  key={cat.titulo}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)' }}
                >
                  <div
                    className="px-7 py-5"
                    style={{ background: 'var(--surface-alt)', borderBottom: '1px solid var(--line)' }}
                  >
                    <h2
                      style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                      className="font-bold mb-1"
                    >
                      {cat.titulo}
                    </h2>
                    <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem', lineHeight: '1.5' }}>
                      {cat.descricao}
                    </p>
                  </div>
                  <div style={{ background: 'var(--surface)' }}>
                    {cat.documentos.map((doc, i) => (
                      <div
                        key={doc.nome}
                        className="documento-row px-7 py-4 flex items-center gap-3 transition-colors"
                        style={{
                          borderTop: i === 0 ? 'none' : '1px solid var(--line)',
                          cursor: 'pointer',
                          background: 'var(--surface)',
                        }}
                      >
                        <PdfIcon />
                        <div className="flex-1 min-w-0">
                          <p
                            style={{ color: 'var(--ink-800)', fontSize: '0.9375rem', fontWeight: 500 }}
                            className="truncate"
                          >
                            {doc.nome}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span style={{ color: 'var(--ink-400)', fontSize: '0.75rem' }}>{doc.tamanho}</span>
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}
                          >
                            PDF
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div className="max-w-2xl mx-auto text-center">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Contato
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold mb-4"
              >
                Precisa de um documento específico?
              </h2>
              <p style={{ color: 'var(--ink-500)', lineHeight: '1.7' }} className="mb-8">
                Nossa secretaria está disponível para atender solicitações de documentos acadêmicos
                e institucionais. Entre em contato pelos canais abaixo.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <a
                  href={EMAIL_HREF}
                  className="btn btn-primary justify-center"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  {EMAIL_CONTATO}
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline justify-center"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
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
