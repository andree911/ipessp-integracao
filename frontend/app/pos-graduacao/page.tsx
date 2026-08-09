'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { WHATSAPP_URL } from '@/lib/contato';

const areas = [
  {
    label: 'Todas',
    key: 'todas',
  },
  { label: 'Cardiologia', key: 'Cardiologia' },
  { label: 'Diagnóstico Laboratorial', key: 'Diagnóstico Laboratorial' },
  { label: 'Estética', key: 'Estética' },
  { label: 'Gestão em Saúde', key: 'Gestão em Saúde' },
  { label: 'Farmácia', key: 'Farmácia' },
  { label: 'Enfermagem', key: 'Enfermagem' },
  { label: 'Outras Áreas', key: 'Outras Áreas' },
];

const cursos = [
  { nome: 'Circulação Extracorpórea – Perfusão', area: 'Cardiologia', modalidade: 'Presencial' },
  { nome: 'Curso Introdutório de Circulação Extracorpórea', area: 'Cardiologia', modalidade: 'Presencial' },
  { nome: 'ECMO Básico para Equipe Multidisciplinar', area: 'Cardiologia', modalidade: 'Presencial' },
  { nome: 'Análises Clínicas – Da Prática à Clínica', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Citogenética Clínica', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Biologia Molecular', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Citologia Clínica', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Imunologia e Oncohematologia', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Microbiologia Clínica', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Hematologia e Hemoterapia Laboratorial', area: 'Diagnóstico Laboratorial', modalidade: 'Presencial' },
  { nome: 'Biomedicina Estética Avançada', area: 'Estética', modalidade: 'Presencial' },
  { nome: 'Farmácia Estética Avançada', area: 'Estética', modalidade: 'Presencial' },
  { nome: 'Biologia Estética Avançada', area: 'Estética', modalidade: 'Presencial' },
  { nome: 'Enfermagem Estética', area: 'Estética', modalidade: 'Presencial' },
  { nome: 'Harmonização Orofacial (HOF)', area: 'Estética', modalidade: 'Presencial' },
  { nome: 'Administração Hospitalar – Online ao Vivo', area: 'Gestão em Saúde', modalidade: 'Online ao Vivo' },
  { nome: 'Auditoria nos Serviços de Saúde', area: 'Gestão em Saúde', modalidade: 'Online' },
  { nome: 'Saúde Pública e Estratégia em Saúde da Família', area: 'Gestão em Saúde', modalidade: 'Presencial' },
  { nome: 'Direito da Saúde – Lato Sensu', area: 'Gestão em Saúde', modalidade: 'Presencial' },
  { nome: 'Farmácia Clínica e Atenção Farmacêutica', area: 'Farmácia', modalidade: 'EAD' },
  { nome: 'Farmácia Oncológica – Online c/ Estágio na FMUSP', area: 'Farmácia', modalidade: 'Online' },
  { nome: 'Enfermagem Estética', area: 'Enfermagem', modalidade: 'Presencial' },
  { nome: 'Enfermagem Estética Avançado 40% EAD', area: 'Enfermagem', modalidade: '40% EAD' },
  { nome: 'Enfermagem Intensiva Pediátrica e Neonatal', area: 'Enfermagem', modalidade: 'Presencial' },
  { nome: 'Enfermagem Intensiva Adulto', area: 'Enfermagem', modalidade: 'Presencial' },
  { nome: 'Acupuntura Integrativa – Medicina Chinesa', area: 'Outras Áreas', modalidade: 'Presencial' },
  { nome: 'Análises Clínicas Veterinária', area: 'Outras Áreas', modalidade: 'Presencial' },
  { nome: 'Docência e Pesquisa em Ciências e Saúde', area: 'Outras Áreas', modalidade: 'Presencial' },
  { nome: 'Gerontologia – 40% EAD', area: 'Outras Áreas', modalidade: '40% EAD' },
  { nome: 'Ressonância Magnética e Tomografia Computadorizada', area: 'Outras Áreas', modalidade: 'Presencial' },
  { nome: 'MBA em Gestão em Saúde', area: 'Outras Áreas', modalidade: 'Online' },
];

const modalidadeCor: Record<string, { bg: string; color: string }> = {
  'Presencial': { bg: 'rgba(155,28,28,0.08)', color: 'var(--brand-700)' },
  'EAD': { bg: 'rgba(37,99,235,0.08)', color: '#1d4ed8' },
  '40% EAD': { bg: 'rgba(37,99,235,0.08)', color: '#1d4ed8' },
  'Online': { bg: 'rgba(16,122,87,0.1)', color: '#065f46' },
  'Online ao Vivo': { bg: 'rgba(16,122,87,0.1)', color: '#065f46' },
};

export default function PosGraduacao() {
  const [areaAtiva, setAreaAtiva] = useState('todas');

  const cursosFiltrados = areaAtiva === 'todas'
    ? cursos
    : cursos.filter(c => c.area === areaAtiva);

  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Especialização
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              54 cursos de<br />Pós-Graduação
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Especializações lato sensu nas principais áreas da saúde. Professores mestres e doutores, laboratórios modernos e certificação reconhecida.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ marginBottom: '40px' }}>
              <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
                Filtrar por área
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {areas.map((area) => (
                  <button
                    key={area.key}
                    onClick={() => setAreaAtiva(area.key)}
                    style={{
                      background: areaAtiva === area.key ? 'var(--brand-600)' : 'var(--surface-alt)',
                      color: areaAtiva === area.key ? 'white' : 'var(--ink-700)',
                      border: areaAtiva === area.key ? '2px solid var(--brand-600)' : '2px solid var(--line)',
                      borderRadius: 'var(--radius-pill)',
                      padding: '8px 20px',
                      fontSize: 'var(--fs-sm)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {area.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)' }}>
                Exibindo <strong style={{ color: 'var(--ink-900)' }}>{cursosFiltrados.length}</strong> cursos
                {areaAtiva !== 'todas' ? ` em ${areaAtiva}` : ''}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {cursosFiltrados.map((curso) => {
                const cor = modalidadeCor[curso.modalidade] ?? { bg: 'var(--surface-alt)', color: 'var(--ink-700)' };
                return (
                  <div
                    key={`${curso.area}-${curso.nome}`}
                    style={{
                      background: 'var(--surface-alt)',
                      borderRadius: 'var(--radius-md)',
                      padding: '24px 24px',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      transition: 'box-shadow 0.2s ease',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = ''; }}
                  >
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--brand-50)', color: 'var(--brand-600)', borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {curso.area}
                      </span>
                      <span style={{ background: cor.bg, color: cor.color, borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.75rem', fontWeight: 600 }}>
                        {curso.modalidade}
                      </span>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, color: 'var(--ink-900)', lineHeight: 1.35 }}>
                      {curso.nome}
                    </h3>
                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto' }}
                    >
                      Saiba mais
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site" style={{ textAlign: 'center' }}>
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>
              Turmas com vagas abertas
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'white', maxWidth: '600px', margin: '0 auto 20px' }}>
              Pronto para avançar na carreira?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '480px', margin: '0 auto 36px', lineHeight: 'var(--lh-body)' }}>
              Fale com nosso time de consultores e descubra qual pós-graduação é ideal para o seu perfil e objetivos profissionais.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Falar com consultor
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
