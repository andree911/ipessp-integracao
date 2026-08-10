'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const secoes = [
  {
    titulo: 'Política de Privacidade e Proteção de Dados Pessoais',
    conteudo: [
      'A IPESSP conduz suas atividades, inclusive o tratamento de Dados Pessoais, pautada por seus Valores Fundamentais, de Inovação, Integridade e Responsabilidade, e pela cultura da Ética e Conformidade.',
      'Esta Política de Privacidade e Proteção de Dados Pessoais da IPESSP se aplica a todos que navegam neste Website e aqueles que se comunicam com a nossa empresa por meio dos nossos canais de atendimento, sejam profissionais da saúde ou relacionados, pacientes, consumidores, colaboradores, ex-colaboradores, dentre outros, ainda que não tenham uma conta cadastrada, mas que tenham seus dados tratados pela nossa empresa.',
      'Esta Política estabelece as condições de uso e de atendimento do Website www.ipessp.edu.br e de nossos canais. É muito importante que você leia esta Política para entender como seus dados pessoais podem ser tratados pela nossa empresa.',
      'Caso você tenha dúvidas ou requisições, relacionadas aos seus Dados Pessoais, entre em contato com nosso Encarregado pela Proteção de Dados Pessoais, através do e-mail: contato@ipessp.edu.br',
    ],
  },
  {
    titulo: '1. Qual o objetivo desta Política e nosso compromisso?',
    conteudo: [
      'O tratamento (uso) de dados pessoais é necessário para a realização de várias das atividades legítimas da nossa empresa.',
      'Sabemos, entretanto, o quanto os seus dados pessoais são importantes para você e, portanto, temos o compromisso de tratar (usar) seus dados pessoais sempre em conformidade com as formas autorizadas pela legislação vigente.',
      'Nesse sentido, esta Política tem o objetivo de informar, de maneira simples, como seus dados pessoais podem ser tratados e protegidos pela nossa empresa e como você pode exercer seus direitos como titular de dados pessoais. Para facilitar o entendimento, dividimos o conteúdo nos seguintes tópicos:',
      '• Definições',
      '• Quais dados pessoais são coletados?',
      '• Para quais finalidades tratamos (utilizamos) dados pessoais?',
      '• O que são cookies?',
      '• Com quem podemos compartilhar dados pessoais?',
      '• Como mantemos dados pessoais seguros?',
      '• Por quanto tempo os dados pessoais serão armazenados?',
      '• Seus direitos como Titular de Dados Pessoais e como exercê-los?',
    ],
  },
  {
    titulo: '2. Definições',
    conteudo: [
      'Para facilitar o entendimento, listamos a seguir as principais definições e termos, normalmente relacionados à privacidade e proteção de dados pessoais, e nos referimos a estes no texto desta Política:',
      '• LGPD – Lei Geral de Proteção de Dados Pessoais, lei n.º 13.709/2018.',
      '• Dado pessoal – Informação relacionada a pessoa natural, identificada ou identificável.',
      '• Dado pessoal sensível – Dados pessoais sobre a origem racial ou étnica, convicção religiosa, opinião política, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dados referentes à saúde ou à vida sexual, dados genéticos ou biométricos, quando vinculados a uma pessoa natural.',
      '• Titular – Pessoa natural a quem se referem os dados pessoais que são objeto de tratamento. Essas pessoas podem ser profissionais da saúde ou relacionados, pacientes, consumidores, colaboradores, ex-colaboradores ou outras pessoas naturais.',
      '• Usuários – Pessoas que acessam o nosso Website e/ou interagem com as atividades nele oferecidas.',
      '• Controlador – Pessoa natural ou jurídica, de direito público ou privado, a quem competem as decisões referentes ao tratamento de dados pessoais. A nossa empresa pode atuar como Controladora e/ou Operadora, no tratamento de Dados Pessoais.',
      '• Operador – Pessoa natural ou jurídica, de direito público ou privado, que realiza tratamento de dados pessoais em nome do controlador. A nossa empresa pode atuar como Controladora e/ou Operadora, no tratamento de Dados Pessoais.',
      '• Encarregado – Pessoa indicada pelo controlador e operador para atuar como canal de comunicação entre o controlador, os titulares dos dados pessoais e a Autoridade Nacional de Proteção de Dados (ANPD). Nosso Encarregado pela Proteção de Dados Pessoais pode ser contatado através do e-mail: contato@ipessp.edu.br',
      '• Tratamento – Toda operação realizada com dados pessoais, como aquelas que se referem à coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.',
      '• Anonimização – Processos por meio dos quais os dados pessoais perdem a possibilidade de associação, direta ou indireta, a um indivíduo, considerada a utilização de meios técnicos razoáveis e disponíveis no momento do tratamento. Nos termos da lei, a LGPD não se aplica aos dados pessoais anonimizados.',
      '• Coleta automática – Coleta realizada pelo acesso aos canais digitais da nossa empresa, sem que, necessariamente, o Titular tenha informado dados pessoais. São exemplos de dados coletados de forma automática os Cookies, logs de acesso, características do dispositivo de acesso ou do navegador, IP (com data e hora), origem do IP, informações sobre cliques, páginas acessadas, termos de procura digitados em nossos canais, dentre outros.',
      '• Cookies – Arquivos enviados pelo servidor do Website para o computador dos Usuários, com a finalidade de identificá-lo e obter dados de acesso, como páginas navegadas ou links clicados, permitindo a personalização da navegação dos Usuários no Website, de acordo com suas preferências.',
      '• IP – Abreviatura de Internet Protocol. É um conjunto de números que identifica a conexão, por meio da qual é possível identificar o computador dos Usuários na Internet.',
      '• Logs – Registros de atividades dos Usuários efetuadas no Website.',
      '• Site ou Website – Designa o endereço eletrônico www.ipessp.edu.br e seus subdomínios.',
    ],
  },
  {
    titulo: '3. Quais dados pessoais são coletados?',
    conteudo: [
      'Para que possamos realizar nossas atividades, pode ser necessário a nossa empresa coletar algumas informações ou dados pessoais relacionados a você.',
      'Essas informações podem ter sido fornecidas diretamente por você, por terceiros contratados ou contactados pela nossa empresa ou coletadas automaticamente.',
      'Alguns exemplos destas informações que podem ser coletadas:',
      '• Informações da área de contato, como nome, e-mail, telefones, estado e cidade.',
      '• Informações financeiras: possíveis valores a serem pagos ou recebidos, por meio de conta bancária ou boletos em razão de nossa relação comercial.',
      '• Informações comportamentais: identificação de acesso, informações sobre cliques, dentre outras, coletadas através de meios tecnológicos, como cookies.',
      'A nossa empresa assegura que os dados pessoais sejam coletados e tratados apenas na medida do necessário, em decorrência de finalidades legítimas, claras e informadas, bem como mediante autorização, que poderá ser o consentimento ou qualquer outra prevista na LGPD, como aquelas previstas nos artigos 7, 11 ou 14.',
    ],
  },
  {
    titulo: '4. Para quais finalidades tratamos (utilizamos) dados pessoais?',
    conteudo: [
      'Os Dados Pessoais podem ser tratados pela nossa empresa para diversas finalidades legítimas. Abaixo, listamos algumas dessas finalidades e exemplos:',
      '• Realizar operações comerciais: realizar atividades de marketing e vendas; responder aos pedidos recebidos; acompanhar interações e reuniões, inclusive quando você entra em contato com a nossa empresa para solicitar informações ou suporte.',
      '• Cumprir obrigações legais ou regulamentares: gerenciar eventos adversos; realizar atividades de prevenção, avaliação e pesquisa; cumprir formalidades administrativas; realizar registros e declarações; atender auditorias.',
      '• Fornecer suporte ao cliente, utilizando dos possíveis dados cadastrais e informações de contato previamente solicitados.',
      '• Dar acesso a serviços: permitir acesso, download, uso ou gerenciamento de aplicativos, Websites e plataformas online.',
      '• Melhorar e desenvolver produtos e serviços: identificar tendências de uso e desenvolver novos produtos e serviços; entender como pessoas e seus dispositivos eletrônicos interagem com nossos serviços e plataformas; rastrear e responder dúvidas de segurança; avaliar a eficácia de nossas campanhas promocionais, realizar pesquisas, dentre outras.',
      '• Personalizar sua experiência ao usar serviços que possam ser oferecidos pela nossa empresa: permitir que os serviços oferecidos sejam apresentados da maneira que melhor se adapte às preferências do Usuário; entender seus interesses profissionais e pessoais em relação ao conteúdo, produtos e serviços disponibilizados em nossos canais de comunicação; apresentar produtos e conteúdos na medida em que os Usuários realizam buscas.',
      '• Para que a nossa empresa possa se comunicar com você: responder suas perguntas; atender suas requisições; fornecer suporte para produtos e serviços; fornecer informações importantes, informações administrativas, avisos necessários e materiais promocionais; enviar notícias e informações sobre nossos produtos, serviços, marcas e operações; organizar e gerenciar eventos, reuniões, aulas e congressos profissionais, remotos ou presenciais.',
      '• Para processar pagamentos que venham a ser necessários, em situações específicas e claramente informadas: receber e verificar dados financeiros, com o objetivo de permitir a realização/recebimento de pagamentos em situações específicas e claramente informadas.',
      '• Oferecer doações e patrocínios: em situações em que sejam permitidos ou aplicáveis.',
      '• Responder a solicitações de autoridades, administrativas ou judiciais, de acordo com as leis aplicáveis: cumprir intimações, apresentar registros necessários, acompanhar, se manifestar ou defender em processos legais.',
      '• Proteger os direitos e interesses da nossa empresa: proteger a saúde e a segurança dos colaboradores, terceiros e instalações da nossa empresa; realizar auditorias internas, gerenciamentos de ativos, sistema e outros controles de negócios; gerenciar e monitorar a administração dos negócios da empresa (incluindo finanças e contabilidade; monitoramento e prevenção de fraudes, dentre outras); manter a segurança dos serviços e operações; proteger os direitos da nossa empresa, sejam de privacidade, segurança ou propriedade; viabilizar soluções; mitigar riscos; limitar danos que possam ser incorridos pela nossa empresa, sempre que necessário; proteger a nossa empresa e empresas afiliadas contra possíveis ações fraudulentas.',
    ],
  },
  {
    titulo: '5. O que são cookies?',
    conteudo: [
      'Cookies são arquivos ou informações que podem ser armazenadas nos dispositivos eletrônicos dos Usuários que visitam o Website ou utilizam os canais digitais da nossa empresa.',
      'A nossa empresa adota uma política ética e transparente em relação ao uso de "cookies".',
      'Ao acessar pela primeira vez o site da nossa empresa, você pode informar suas preferências de utilização de Cookies. Para rever a autorização concedida ou revogá-la, entre em contato através do e-mail contato@ipessp.edu.br',
    ],
  },
  {
    titulo: '6. Com quem podemos compartilhar dados pessoais?',
    conteudo: [
      'Com base nas finalidades descritas acima, pode ser necessário a nossa empresa compartilhar seus dados pessoais com:',
      '• Nossos parceiros, incluindo profissionais, organizações e serviços de saúde, distribuidores, ou outras instituições relacionadas à saúde e indústria farmacêutica.',
      '• Autoridades, entidades governamentais ou outros terceiros, para cumprir normas legais ou regulamentares, para a proteção dos interesses da nossa empresa em qualquer tipo de conflito, incluindo ações judiciais e processos administrativos.',
      '• Fornecedores selecionados, prestadores de serviços ou vendedores, que possam agir de acordo com nossas instruções, seja para hospedagem de sites, análise de dados, processamento de pagamentos, atendimento de pedidos, processamento de tecnologia da informação, fornecimento de infraestrutura relacionada, atendimento ao cliente, entregas de e-mails, auditorias, dentre outras.',
      '• Potenciais adquirentes e outras partes interessadas, no caso de operações de reestruturação societária/legal, como aquisições, fusões, joint ventures, cessões, cisões, investimentos ou desinvestimentos.',
      'Os dados pessoais poderão, ainda, ser objeto de transferência internacional, o que será feito sempre em conformidade com as normas legais e regulamentares, e mediante a utilização de meios ou instrumentos jurídicos que garantam a segurança dos dados pessoais, conforme permitem a LGPD ou outras leis ou regulamentos, a depender do destino da informação.',
    ],
  },
  {
    titulo: '7. Como mantemos dados pessoais seguros?',
    conteudo: [
      'Qualquer dado pessoal tratado pela nossa empresa será armazenado de acordo com os mais rígidos padrões de segurança, o que inclui a adoção de medidas como:',
      '• Proteção dos nossos sistemas contra acessos não autorizados;',
      '• Restrição do acesso aos dados pessoais apenas às pessoas específicas ao local onde estejam armazenados os dados pessoais; e',
      '• Garantia de que colaboradores ou parceiros externos, que precisem realizar o tratamento de dados pessoais, deverão se comprometer a manter o sigilo absoluto, bem como adotar as melhores práticas no eventual tratamento destes dados pessoais, conforme determinam as políticas e procedimentos corporativos, contratos, normas legais ou regulamentares, dentre outras.',
      'Além dos esforços técnicos, a nossa empresa também adota medidas institucionais, visando proteger dados pessoais, através de sua Estrutura de Governança de Privacidade e Proteção de Dados Pessoais, que inclui seu Comitê de Privacidade e Proteção de Dados Pessoais, e o Encarregado pela Proteção de Dados Pessoais.',
    ],
  },
  {
    titulo: '8. Por quanto tempo os dados pessoais serão armazenados?',
    conteudo: [
      'Os dados pessoais serão tratados pela nossa empresa até que deixem de atender às finalidades para as quais foram coletados, quando serão eliminados, ou até o titular dos dados pessoais solicitar a sua eliminação, exceto na hipótese de necessidade da nossa empresa manter o tratamento dos Dados Pessoais para fins de cumprimento de obrigação legal ou regulatória, transferência a terceiro — desde que respeitados os requisitos de tratamento dos dados pessoais — e uso exclusivo da nossa empresa, inclusive para o exercício de seus direitos, inclusive em processos judiciais ou administrativos.',
    ],
  },
  {
    titulo: '9. Seus direitos enquanto titular de dados pessoais e como exercê-los',
    conteudo: [
      'A nossa empresa respeita seus direitos como titular de dados pessoais, estejam esses direitos previstos na Lei Geral de Proteção de Dados Pessoais (LGPD) ou em outras normas legais ou regulamentares. Dessa forma, no que diz respeito ao tratamento de dados pessoais, a nossa empresa garante a você — titular — o direito de realizar as seguintes solicitações:',
      '• Confirmação da existência de tratamento – Você pode solicitar a consulta de eventual atividade de tratamento dos seus dados pessoais.',
      '• Acesso aos seus dados pessoais – De forma simples (extrato simplificado) ou completa (origem dos dados, inexistência de registro, critérios utilizados e finalidade do tratamento, observados os segredos de negócio e demais determinações legais de confidencialidade).',
      '• Correção de dados pessoais incompletos, inexatos ou desatualizados.',
      '• Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com as normas legais ou regulamentares.',
      '• Revogação do consentimento, a qualquer momento, quando o tratamento for baseado em consentimento.',
      '• Eliminação dos dados tratados com consentimento do Titular, mediante solicitação expressa.',
      '• Obtenção de informações sobre as entidades públicas ou privadas com as quais a nossa empresa tenha compartilhado seus dados pessoais.',
      '• Informação sobre a possibilidade de não fornecer o seu consentimento e sobre as consequências dessa negativa.',
      '• Revisão de decisão automatizada que envolva o tratamento dos seus dados pessoais ou que lhe afete diretamente.',
      'Todas as requisições recebidas dos titulares são viabilizadas de forma gratuita e submetidas a validação de identidade, para garantir o atendimento ao verdadeiro titular dos dados pessoais. As requisições são avaliadas pelo Comitê de Privacidade e Proteção de Dados Pessoais da nossa empresa, que poderá solicitar informações adicionais. Em algumas situações previstas em normas legais ou regulamentares, as requisições podem não ser atendidas, com as justificativas pertinentes apresentadas ao titular.',
      'Para exercer seus direitos como titular de dados pessoais, basta realizar sua requisição pelo nosso canal contato@ipessp.edu.br',
    ],
  },
  {
    titulo: '10. Legislação aplicável e alterações desta Política',
    conteudo: [
      'Esta Política foi elaborada com base na LGPD e as requisições e direitos aqui previstos poderão ser exercidos a partir da vigência da LGPD.',
      'A nossa empresa poderá, a seu critério e a qualquer momento, alterar, acrescentar, adaptar ou remover partes desta Política.',
      'Esta Política de Privacidade e Proteção de Dados Pessoais da IPESSP foi atualizada em setembro de 2020.',
      'A nossa empresa está comprometida com a privacidade dos titulares de dados pessoais. Para quaisquer esclarecimentos sobre nossas práticas de privacidade e para o exercício dos seus direitos como titular de dados pessoais, entre em contato através do e-mail contato@ipessp.edu.br',
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
                Atualizada em Setembro de 2020
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
                    <strong>Controlador:</strong> IPESSP — Instituto de Pesquisa e Educação em Saúde de São Paulo &nbsp;·&nbsp;
                    <strong>Última atualização:</strong> Setembro de 2020
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
                    Entre em contato com nosso Encarregado de Proteção de Dados.
                  </p>
                  <a href="mailto:contato@ipessp.edu.br" className="btn btn-primary">
                    contato@ipessp.edu.br
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
