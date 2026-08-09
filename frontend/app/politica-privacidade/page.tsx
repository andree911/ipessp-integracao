'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const secoes = [
  {
    titulo: '1. Identificação do Controlador',
    conteudo: [
      'A Faculdade IPESSP — Instituto de Pesquisa e Educação em Saúde de São Paulo, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 03.618.447/0001-90, com sede na Rua Dona Antônia de Queirós, 333, Consolação, São Paulo/SP, CEP: 01307-012, é a controladora dos dados pessoais coletados por meio de seu site, plataformas digitais e demais canais de atendimento.',
      'Para entrar em contato com o encarregado de proteção de dados (DPO), utilize o e-mail: dpo@ipessp.edu.br.',
    ],
  },
  {
    titulo: '2. Dados Pessoais Coletados',
    conteudo: [
      'Coletamos os seguintes tipos de dados pessoais:',
      '• Dados de identificação: nome completo, CPF, RG, data de nascimento, gênero.',
      '• Dados de contato: endereço de e-mail, número de telefone, endereço residencial.',
      '• Dados acadêmicos: histórico escolar, diplomas, certificados, documentação de matrícula.',
      '• Dados financeiros: informações de pagamento e histórico de transações (nunca armazenamos dados completos de cartão de crédito).',
      '• Dados de navegação: endereço IP, tipo de navegador, páginas acessadas, tempo de permanência, cookies de sessão e analytics.',
      '• Dados fornecidos voluntariamente: mensagens enviadas por formulários, e-mail e WhatsApp.',
    ],
  },
  {
    titulo: '3. Finalidade do Tratamento',
    conteudo: [
      'Os dados pessoais coletados são tratados para as seguintes finalidades:',
      '• Execução contratual: processamento de matrículas, gerenciamento de registros acadêmicos, emissão de diplomas e certificados.',
      '• Comunicação institucional: envio de informações sobre cursos, eventos, bolsas e novidades da instituição.',
      '• Atendimento ao aluno: suporte à secretaria acadêmica, financeiro e técnico.',
      '• Cumprimento de obrigações legais: atendimento a exigências do MEC, Receita Federal e demais órgãos regulatórios.',
      '• Marketing e melhorias: análise de uso do site para aprimoramento dos nossos serviços e comunicações.',
      '• Pesquisas institucionais: avaliações de satisfação e pesquisas acadêmicas com dados anonimizados.',
    ],
  },
  {
    titulo: '4. Base Legal para o Tratamento',
    conteudo: [
      'O tratamento de dados pessoais pelo IPESSP está fundamentado nas seguintes bases legais previstas na Lei nº 13.709/2018 (LGPD):',
      '• Execução de contrato (art. 7º, V): quando os dados são necessários para a prestação dos serviços educacionais contratados.',
      '• Cumprimento de obrigação legal (art. 7º, II): quando exigido por legislação aplicável ao setor educacional.',
      '• Legítimo interesse (art. 7º, IX): para fins de comunicação institucional e melhoria dos serviços.',
      '• Consentimento (art. 7º, I): para atividades específicas de marketing, onde o titular manifesta expressamente sua concordância.',
    ],
  },
  {
    titulo: '5. Compartilhamento de Dados',
    conteudo: [
      'O IPESSP não vende dados pessoais a terceiros. Os dados poderão ser compartilhados com:',
      '• Órgãos governamentais: MEC, INEP e demais órgãos regulatórios, quando exigido por lei.',
      '• Fornecedores de tecnologia: empresas de hospedagem, plataformas de e-learning e sistemas de gestão acadêmica, mediante acordo de confidencialidade.',
      '• Parceiros acadêmicos: hospitais e instituições parceiras para fins de estágio supervisionado, com consentimento do titular.',
      '• Prestadores de serviço financeiro: processadoras de pagamento para transações financeiras seguras.',
    ],
  },
  {
    titulo: '6. Retenção de Dados',
    conteudo: [
      'Os dados acadêmicos são mantidos pelo período mínimo exigido pela legislação educacional brasileira (mínimo de 20 anos para registros acadêmicos, conforme Portaria MEC nº 1.224/2013).',
      'Dados de marketing e navegação são mantidos por até 2 anos a partir da última interação.',
      'Dados fornecidos em formulários de contato são mantidos por até 5 anos.',
      'Após o prazo de retenção, os dados são eliminados de forma segura ou anonimizados.',
    ],
  },
  {
    titulo: '7. Direitos do Titular',
    conteudo: [
      'Nos termos da LGPD, o titular dos dados tem os seguintes direitos:',
      '• Acesso: confirmar a existência de tratamento e obter cópia dos seus dados.',
      '• Correção: solicitar a correção de dados incompletos, inexatos ou desatualizados.',
      '• Anonimização, bloqueio ou eliminação: de dados desnecessários, excessivos ou tratados em desconformidade.',
      '• Portabilidade: obter seus dados em formato estruturado para transferência a outro fornecedor.',
      '• Eliminação: solicitar a eliminação de dados tratados com base no consentimento.',
      '• Informação: ser informado sobre com quais entidades seus dados são compartilhados.',
      '• Revogação do consentimento: retirar o consentimento a qualquer momento.',
      'Para exercer seus direitos, entre em contato com o DPO pelo e-mail dpo@ipessp.edu.br.',
    ],
  },
  {
    titulo: '8. Segurança dos Dados',
    conteudo: [
      'O IPESSP adota medidas técnicas e organizacionais adequadas para proteger os dados pessoais contra acessos não autorizados, perda, destruição, alteração e divulgação indevida, incluindo:',
      '• Criptografia de dados em trânsito e em repouso.',
      '• Controles de acesso baseados no princípio do menor privilégio.',
      '• Monitoramento contínuo de sistemas e logs de acesso.',
      '• Treinamento periódico da equipe em segurança da informação e privacidade.',
    ],
  },
  {
    titulo: '9. Cookies',
    conteudo: [
      'Utilizamos cookies e tecnologias similares para melhorar sua experiência de navegação. Os cookies utilizados incluem:',
      '• Cookies essenciais: necessários para o funcionamento do site (sessão, autenticação).',
      '• Cookies analíticos: para entender como os visitantes interagem com o site (Google Analytics).',
      '• Cookies de marketing: para personalizar comunicações e anúncios relevantes.',
      'Você pode gerenciar suas preferências de cookies pelas configurações do seu navegador ou pelo banner de consentimento exibido na sua primeira visita.',
    ],
  },
  {
    titulo: '10. Alterações nesta Política',
    conteudo: [
      'Esta Política de Privacidade pode ser atualizada periodicamente para refletir mudanças em nossas práticas ou na legislação aplicável.',
      'Alterações relevantes serão comunicadas por e-mail aos titulares cadastrados e destacadas nesta página.',
      'A continuidade do uso dos nossos serviços após a comunicação de alterações implica na aceitação da versão atualizada.',
    ],
  },
  {
    titulo: '11. Contato e Encarregado de Dados (DPO)',
    conteudo: [
      'Para dúvidas, solicitações ou reclamações relacionadas ao tratamento de dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados:',
      '• E-mail: dpo@ipessp.edu.br',
      '• Endereço: Rua Dona Antônia de Queirós, 333 — Consolação, São Paulo/SP, CEP: 01307-012',
      '• Horário de atendimento: Segunda a Sexta, das 9h às 17h',
      'Caso não esteja satisfeito com nossa resposta, você poderá reportar sua reclamação à Autoridade Nacional de Proteção de Dados (ANPD): www.gov.br/anpd',
    ],
  },
];

export default function PoliticaPrivacidade() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Legal
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '16px' }}>
              Política de Privacidade
            </h1>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-pill)', padding: '5px 16px', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                Em conformidade com a LGPD (Lei nº 13.709/2018)
              </span>
              <span style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.8)', borderRadius: 'var(--radius-pill)', padding: '5px 16px', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                Vigência: Janeiro de 2024
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Esta política descreve como o IPESSP coleta, usa, armazena e protege seus dados pessoais. Leia atentamente antes de utilizar nossos serviços.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 'clamp(40px,5vw,64px)', alignItems: 'start' }}>
              <div style={{ position: 'sticky', top: '100px' }} className="hidden lg:block">
                <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                  Índice
                </p>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {secoes.map((s, i) => (
                    <a
                      key={i}
                      href={`#secao-${i}`}
                      style={{ color: 'var(--ink-700)', fontSize: '0.82rem', textDecoration: 'none', padding: '6px 10px', borderRadius: 'var(--radius-sm)', lineHeight: 1.4, transition: 'background 0.15s, color 0.15s' }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--brand-50)';
                        (e.currentTarget as HTMLElement).style.color = 'var(--brand-600)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '';
                        (e.currentTarget as HTMLElement).style.color = 'var(--ink-700)';
                      }}
                    >
                      {s.titulo}
                    </a>
                  ))}
                </nav>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
                <div style={{ padding: '24px', background: 'var(--brand-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-100)' }}>
                  <p style={{ color: 'var(--brand-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    <strong>CNPJ:</strong> 03.618.447/0001-90 &nbsp;·&nbsp;
                    <strong>Controlador:</strong> Faculdade IPESSP — Instituto de Pesquisa e Educação em Saúde de São Paulo &nbsp;·&nbsp;
                    <strong>Última atualização:</strong> Janeiro de 2024
                  </p>
                </div>

                {secoes.map((secao, i) => (
                  <section key={i} id={`secao-${i}`}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid var(--line)' }}>
                      {secao.titulo}
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {secao.conteudo.map((paragrafo, j) => (
                        <p
                          key={j}
                          style={{
                            color: paragrafo.startsWith('•') ? 'var(--ink-700)' : 'var(--ink-700)',
                            fontSize: 'var(--fs-sm)',
                            lineHeight: 'var(--lh-body)',
                            paddingLeft: paragrafo.startsWith('•') ? '16px' : '0',
                          }}
                        >
                          {paragrafo}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}

                <div style={{ padding: '28px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', textAlign: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '12px' }}>
                    Dúvidas sobre sua privacidade?
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', marginBottom: '20px', lineHeight: 'var(--lh-body)' }}>
                    Entre em contato com nosso Encarregado de Proteção de Dados (DPO).
                  </p>
                  <a href="mailto:dpo@ipessp.edu.br" className="btn btn-primary">
                    dpo@ipessp.edu.br
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
