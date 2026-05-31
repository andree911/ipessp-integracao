'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const categorias = [
  {
    key: 'ead',
    label: 'EAD (40% a distância)',
    cor: '#1d4ed8',
    bg: 'rgba(37,99,235,0.08)',
    cursos: [
      { nome: 'Análises Clínicas EAD', descricao: 'Especialização em análises clínicas com 40% da carga horária a distância, conciliando teoria e prática laboratorial.' },
      { nome: 'Biologia Estética Avançada EAD', descricao: 'Aprofundamento em estética avançada com metodologia híbrida para biologistas.' },
      { nome: 'Biomedicina Estética Avançada EAD', descricao: 'Capacitação em procedimentos estéticos avançados para biomédicos com flexibilidade EAD.' },
      { nome: 'Farmácia Estética EAD', descricao: 'Formação em cosmetologia e estética farmacêutica com modalidade semipresencial.' },
      { nome: 'Gestão Estratégica nos Serviços de Saúde EAD', descricao: 'Desenvolvimento de competências de gestão para profissionais que atuam em serviços de saúde.' },
    ],
  },
  {
    key: 'capacitacao',
    label: 'Capacitação',
    cor: 'var(--brand-700)',
    bg: 'var(--brand-50)',
    cursos: [
      { nome: 'Análises Clínicas', descricao: 'Programa de capacitação prática em laboratório clínico com foco em habilidades técnicas e boas práticas laboratoriais.' },
    ],
  },
  {
    key: 'atualizacao',
    label: 'Atualização',
    cor: '#065f46',
    bg: 'rgba(16,122,87,0.08)',
    cursos: [
      { nome: 'Atualização em Estética', descricao: 'Atualização nas novas técnicas e protocolos estéticos, com foco em procedimentos não-invasivos e inovação na área.' },
      { nome: 'Atualização em Fisioterapia', descricao: 'Novas abordagens terapêuticas em fisioterapia, técnicas modernas de reabilitação e tendências da área.' },
      { nome: 'Atualização em Análises Clínicas', descricao: 'Atualize-se sobre novos métodos diagnósticos, controle de qualidade e gestão laboratorial.' },
    ],
  },
  {
    key: 'tecnicos',
    label: 'Técnicos',
    cor: '#7c3aed',
    bg: 'rgba(124,58,237,0.08)',
    cursos: [
      { nome: 'Técnico Veterinário', descricao: 'Formação técnica para auxiliares veterinários com ênfase em análises clínicas e laboratoriais na medicina veterinária.' },
    ],
  },
];

export default function CursosLivres() {
  const [ativo, setAtivo] = useState('ead');

  const categoriaAtiva = categorias.find(c => c.key === ativo)!;

  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Formação Complementar
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Cursos Livres
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Capacitações, atualizações e cursos técnicos para profissionais da saúde que buscam evolução contínua com flexibilidade de horários.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ marginBottom: '48px' }}>
              <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Categorias
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {categorias.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => setAtivo(cat.key)}
                    style={{
                      background: ativo === cat.key ? 'var(--brand-600)' : 'var(--surface-alt)',
                      color: ativo === cat.key ? 'white' : 'var(--ink-700)',
                      border: ativo === cat.key ? '2px solid var(--brand-600)' : '2px solid var(--line)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '10px 24px',
                      fontSize: 'var(--fs-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '32px', paddingBottom: '24px', borderBottom: '1px solid var(--line)' }}>
              <span style={{ background: categoriaAtiva.bg, color: categoriaAtiva.cor, borderRadius: 'var(--radius-pill)', padding: '6px 18px', fontSize: 'var(--fs-sm)', fontWeight: 700 }}>
                {categoriaAtiva.label}
              </span>
              <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)', marginTop: '10px' }}>
                {categoriaAtiva.cursos.length} {categoriaAtiva.cursos.length === 1 ? 'curso disponível' : 'cursos disponíveis'}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
              {categoriaAtiva.cursos.map((curso) => (
                <div
                  key={curso.nome}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '32px 28px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                    (e.currentTarget as HTMLElement).style.transform = '';
                  }}
                >
                  <span style={{ background: categoriaAtiva.bg, color: categoriaAtiva.cor, borderRadius: 'var(--radius-pill)', padding: '4px 14px', fontSize: '0.75rem', fontWeight: 600, alignSelf: 'flex-start' }}>
                    {categoriaAtiva.label}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.3 }}>
                    {curso.nome}
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', flex: 1 }}>
                    {curso.descricao}
                  </p>
                  <a
                    href="https://wa.me/5511976922127"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ alignSelf: 'flex-start', fontSize: 'var(--fs-sm)', padding: '10px 22px' }}
                  >
                    Saiba mais
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
              Vagas disponíveis
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', maxWidth: '560px', margin: '0 auto 20px' }}>
              Amplie seu conhecimento com o IPESSP
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '460px', margin: '0 auto 36px', lineHeight: 'var(--lh-body)' }}>
              Nossos cursos livres são ideais para profissionais que buscam atualização rápida e prática sem abrir mão da qualidade do ensino.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="https://wa.me/5511976922127" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Falar no WhatsApp
              </a>
              <a href="/fale-conosco" className="btn btn-white">
                Solicitar informações
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
