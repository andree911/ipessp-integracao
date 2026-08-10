'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { sophiaPortalUrl } from '@/lib/contato';

const bases = [
  {
    nome: 'BVS – Biblioteca Virtual em Saúde',
    descricao: 'Portal com acesso a literatura científica em saúde da América Latina e Caribe, incluindo LILACS, MEDLINE e outras bases regionais.',
    href: 'https://pesquisa.bvsalud.org/brasil/',
    tipo: 'Gratuita',
  },
  {
    nome: 'LILACS – BIREME',
    descricao: 'Literatura Latino-Americana e do Caribe em Ciências da Saúde, mantida pela BIREME/OPAS/OMS.',
    href: 'https://bases.bireme.br/cgi-bin/wxislind.exe/iah/online/',
    tipo: 'Gratuita',
  },
  {
    nome: 'SciELO',
    descricao: 'Scientific Electronic Library Online — coleção de periódicos científicos brasileiros e latino-americanos de livre acesso.',
    href: 'https://www.scielo.br/',
    tipo: 'Gratuita',
  },
  {
    nome: 'PubMed',
    descricao: 'Base de dados da National Library of Medicine com referências bibliográficas nas ciências da vida e biomedicina.',
    href: 'https://www.ncbi.nlm.nih.gov/',
    tipo: 'Gratuita',
  },
  {
    nome: 'ScienceDirect',
    descricao: 'Plataforma da Elsevier com artigos científicos e capítulos de livros de diversas áreas do conhecimento.',
    href: 'https://www.sciencedirect.com/',
    tipo: 'Gratuita',
  },
  {
    nome: 'Periódicos CAPES',
    descricao: 'Portal de acesso a periódicos científicos nacionais e internacionais disponível para alunos de instituições de ensino superior credenciadas.',
    href: 'https://www.periodicos.capes.gov.br/',
    tipo: 'Acesso via CPF',
  },
  {
    nome: 'Teses CAPES',
    descricao: 'Catálogo de teses e dissertações defendidas em programas de pós-graduação no Brasil.',
    href: 'https://www.gov.br/capes/pt-br',
    tipo: 'Gratuita',
  },
  {
    nome: 'Biblioteca Digital USP',
    descricao: 'Acervo digital da Universidade de São Paulo, com obras raras e coleções especiais.',
    href: 'https://www.bbm.usp.br/',
    tipo: 'Gratuita',
  },
  {
    nome: 'Teses USP',
    descricao: 'Repositório de teses e dissertações da Universidade de São Paulo.',
    href: 'https://www.teses.usp.br/',
    tipo: 'Gratuita',
  },
  {
    nome: 'Domínio Público',
    descricao: 'Biblioteca digital do governo federal com obras literárias, artísticas e científicas em domínio público.',
    href: 'https://www.dominiopublico.gov.br/',
    tipo: 'Gratuita',
  },
  {
    nome: 'Biblioteca Fiocruz',
    descricao: 'Acervo digital da Fundação Oswaldo Cruz nas áreas de saúde pública e biomedicina.',
    href: 'https://www.bvsalutz.coc.fiocruz.br/',
    tipo: 'Gratuita',
  },
  {
    nome: 'Internet Archive',
    descricao: 'Uma das maiores bibliotecas digitais do mundo, com livros, artigos e publicações históricas.',
    href: 'https://archive.org/',
    tipo: 'Gratuita',
  },
];

const recursos = [
  {
    titulo: 'E-books de Saúde',
    descricao: 'Acervo digital com títulos nas áreas de biomedicina, farmácia, fisioterapia, enfermagem, gestão hospitalar e estética.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
      </svg>
    ),
  },
  {
    titulo: 'Artigos Científicos',
    descricao: 'Artigos revisados por pares das principais revistas científicas da área da saúde, nacionais e internacionais.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    titulo: 'Periódicos Especializados',
    descricao: 'Assinaturas de periódicos especializados nas áreas de atuação do IPESSP, incluindo publicações nacionais e internacionais.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
  },
  {
    titulo: 'Normas e Manuais',
    descricao: 'Documentos normativos, guias de boas práticas e manuais técnicos das principais agências regulatórias de saúde do Brasil.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
      </svg>
    ),
  },
];

const passosAcesso = [
  { numero: '01', titulo: 'Acesse o Portal do Aluno', descricao: 'Entre em portal.ipessp.edu.br com seu login e senha de aluno regularmente matriculado.' },
  { numero: '02', titulo: 'Navegue até Biblioteca A', descricao: 'No menu principal do portal, acesse a seção "Biblioteca A" ou "Biblioteca Virtual".' },
  { numero: '03', titulo: 'Escolha o recurso', descricao: 'Selecione e-books, artigos, periódicos ou as bases de dados externas disponíveis para sua área.' },
  { numero: '04', titulo: 'Acesse online', descricao: 'O conteúdo pode ser acessado diretamente no navegador ou baixado em formato PDF, conforme disponibilidade.' },
];

export default function BibliotecaVirtual() {
  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Recursos Acadêmicos
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Biblioteca Virtual<br />
              <span style={{ color: 'var(--accent-400)' }}>Biblioteca A</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)', marginBottom: '36px' }}>
              Acervo digital completo com e-books, artigos científicos e periódicos especializados nas áreas da saúde, disponível 24h para alunos matriculados.
            </p>
            <a href={sophiaPortalUrl()} className="btn btn-primary">
              Acessar Biblioteca A
            </a>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Acervo disponível
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Recursos da Biblioteca
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
              {recursos.map((rec) => (
                <div
                  key={rec.titulo}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    {rec.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {rec.titulo}
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    {rec.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Acesso ao acervo
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '36px' }}>
                  Como Acessar
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {passosAcesso.map((etapa) => (
                    <div key={etapa.numero} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--brand-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                        {etapa.numero}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '6px' }}>
                          {etapa.titulo}
                        </h3>
                        <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                          {etapa.descricao}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '32px', padding: '20px', background: 'var(--brand-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-100)' }}>
                  <p style={{ color: 'var(--brand-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    <strong>Suporte:</strong> Seg a Sex das 8h às 18h. Entre em contato pelo e-mail <a href="mailto:biblioteca@ipessp.edu.br" style={{ color: 'var(--brand-600)', fontWeight: 600 }}>biblioteca@ipessp.edu.br</a> ou pelo WhatsApp do suporte.
                  </p>
                </div>
              </div>

              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Bases de dados
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '28px' }}>
                  Bases Disponíveis
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {bases.map((base) => (
                    <a
                      key={base.nome}
                      href={base.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                        padding: '20px 22px',
                        background: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--line)',
                        textDecoration: 'none',
                        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-300)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.boxShadow = '';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, color: 'var(--ink-900)' }}>
                          {base.nome}
                        </h4>
                        <span style={{ background: base.tipo === 'Gratuita' ? 'rgba(16,122,87,0.1)' : 'rgba(233,185,73,0.15)', color: base.tipo === 'Gratuita' ? '#065f46' : '#8a6800', borderRadius: 'var(--radius-pill)', padding: '2px 10px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                          {base.tipo}
                        </span>
                      </div>
                      <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                        {base.descricao}
                      </p>
                      <span style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        Acessar base
                        <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                        </svg>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-16">
          <div className="container-site" style={{ textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', fontWeight: 700, color: 'white', marginBottom: '12px' }}>
              Dúvidas sobre o acervo?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '420px', margin: '0 auto 28px', lineHeight: 'var(--lh-body)' }}>
              Nossa equipe de apoio bibliográfico atende de Seg a Sex das 8h às 18h.
            </p>
            <a
              href="mailto:biblioteca@ipessp.edu.br"
              className="btn btn-white"
            >
              biblioteca@ipessp.edu.br
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
