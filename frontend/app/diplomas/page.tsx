'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { FONE_DISPLAY, FONE_TEL } from '@/lib/contato';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { apiFetch } from '../lib/api';

const tiposDiploma = [
  {
    titulo: 'Diploma de Graduação',
    descricao: 'Diploma de bacharel expedido pela Faculdade IPESSP, reconhecido pelo Ministério da Educação (MEC). Tem validade nacional para exercício das profissões regulamentadas pelos conselhos federais.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    prazo: 'Emitido em até 60 dias após a colação de grau',
  },
  {
    titulo: 'Certificado de Pós-Graduação Lato Sensu',
    descricao: 'Certificado de especialista expedido pela Faculdade IPESSP para cursos de pós-graduação lato sensu, em conformidade com a Resolução CNE/CES nº 1/2018. Válido em todo o território nacional.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 12 18 15 15"/><line x1="12" y1="12" x2="12" y2="18"/>
      </svg>
    ),
    prazo: 'Emitido em até 30 dias após a defesa do TCC',
  },
  {
    titulo: 'Certificado de Cursos Livres',
    descricao: 'Certificado de conclusão expedido para cursos de capacitação, atualização e técnicos. Comprova a formação complementar do profissional de saúde com validade como documento de aperfeiçoamento.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
      </svg>
    ),
    prazo: 'Emitido em até 15 dias após a conclusão',
  },
];

const documentosNecessarios = [
  'RG e CPF (cópias autenticadas)',
  'Diploma ou certificado de conclusão do ensino médio',
  'Diploma ou certificado do curso de graduação (para pós-graduação)',
  'Histórico escolar do curso de origem',
  'Comprovante de quitação de débitos com a instituição',
  'Comprovante de entrega do TCC (para pós-graduação)',
  '2 fotos 3x4 recentes',
  'Comprovante de registro profissional no conselho da categoria (quando aplicável)',
];

const etapas = [
  { numero: '01', titulo: 'Solicitação', descricao: 'Preencha o formulário de solicitação abaixo ou compareça à secretaria acadêmica.' },
  { numero: '02', titulo: 'Entrega de documentos', descricao: 'Entregue os documentos necessários na secretaria (presencialmente ou via e-mail).' },
  { numero: '03', titulo: 'Análise', descricao: 'Nossa equipe analisa a documentação e verifica o cumprimento de todos os requisitos acadêmicos e financeiros.' },
  { numero: '04', titulo: 'Emissão', descricao: 'O diploma ou certificado é emitido no prazo informado e você é notificado para retirada ou envio.' },
];

export default function Diplomas() {
  const [form, setForm] = useState({ nome: '', cpf: '', email: '', curso: '', tipo: '', observacoes: '' });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome || !form.email || !form.tipo) {
      setErro('Preencha nome, e-mail e tipo de documento.');
      return;
    }
    setEnviando(true);
    setErro('');
    try {
      const mensagem = [
        `CPF: ${form.cpf}`,
        `Curso: ${form.curso}`,
        `Tipo: ${form.tipo}`,
        form.observacoes ? `Observações: ${form.observacoes}` : '',
      ].filter(Boolean).join('\n');

      const res = await apiFetch('/v1/mensagens-contato', {
        method: 'POST',
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          assunto: `Solicitação de diploma/certificado: ${form.tipo}`,
          mensagem,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error ?? 'Erro ao enviar. Tente novamente.');
        return;
      }
      setEnviado(true);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <section style={{ background: 'var(--brand-900)' }} className="py-20">
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Secretaria Acadêmica
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Diplomas e Certificados
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Saiba como solicitar seu diploma ou certificado, os documentos necessários e os prazos de emissão.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Documentos emitidos
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Tipos de Diploma e Certificado
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {tiposDiploma.map((tipo) => (
                <div
                  key={tipo.titulo}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '36px 32px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '18px',
                  }}
                >
                  <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-md)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    {tipo.icon}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)' }}>
                    {tipo.titulo}
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', flex: 1 }}>
                    {tipo.descricao}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--line)' }}>
                    <svg width="16" height="16" fill="none" stroke="var(--brand-600)" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span style={{ fontSize: '0.8rem', color: 'var(--ink-700)', fontWeight: 500 }}>
                      {tipo.prazo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'start' }}>
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Passo a passo
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '40px' }}>
                  Como Solicitar
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {etapas.map((etapa) => (
                    <div
                      key={etapa.numero}
                      style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}
                    >
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0 }}>
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
              </div>

              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Documentação
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '32px' }}>
                  Documentos Necessários
                </h2>
                <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '28px', border: '1px solid var(--line)' }}>
                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {documentosNecessarios.map((doc) => (
                      <li
                        key={doc}
                        style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="var(--brand-600)" strokeWidth="2.5" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <span style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                          {doc}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '20px', padding: '20px', background: 'var(--brand-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-100)' }}>
                  <p style={{ color: 'var(--brand-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    <strong>Importante:</strong> Todos os documentos devem ser entregues em cópias autenticadas em cartório. Para envio digital, utilize PDF com alta resolução.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site" style={{ maxWidth: '720px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Formulário online
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)' }}>
                Solicitar Diploma ou Certificado
              </h2>
            </div>

            {enviado ? (
              <div style={{ padding: '32px', background: 'var(--brand-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--brand-200)', textAlign: 'center' }}>
                <p style={{ color: 'var(--brand-700)', fontWeight: 700, fontSize: 'var(--fs-h3)', marginBottom: '8px' }}>Solicitação enviada!</p>
                <p style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)' }}>Nossa secretaria entrará em contato em breve pelo e-mail informado.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                      Nome completo *
                    </label>
                    <input
                      type="text"
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                      CPF *
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={form.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      required
                      style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none' }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                    E-mail *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="seu@email.com"
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                    Curso *
                  </label>
                  <input
                    type="text"
                    name="curso"
                    value={form.curso}
                    onChange={handleChange}
                    placeholder="Nome do curso concluído"
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                    Tipo de documento *
                  </label>
                  <select
                    name="tipo"
                    value={form.tipo}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none' }}
                  >
                    <option value="">Selecione o tipo</option>
                    <option value="Diploma de Graduação">Diploma de Graduação</option>
                    <option value="Certificado de Pós-Graduação">Certificado de Pós-Graduação</option>
                    <option value="Certificado de Curso Livre">Certificado de Curso Livre</option>
                    <option value="Histórico Escolar">Histórico Escolar</option>
                    <option value="Declaração de Matrícula">Declaração de Matrícula</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                    Observações
                  </label>
                  <textarea
                    name="observacoes"
                    value={form.observacoes}
                    onChange={handleChange}
                    placeholder="Informações adicionais ou dúvidas..."
                    rows={4}
                    style={{ width: '100%', padding: '12px 16px', border: '2px solid var(--line)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', resize: 'vertical' }}
                  />
                </div>
                {erro && <p style={{ color: '#dc2626', fontSize: 'var(--fs-sm)' }}>{erro}</p>}
                <button
                  type="submit"
                  disabled={enviando}
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                >
                  {enviando ? 'Enviando...' : 'Enviar solicitação'}
                </button>
              </form>
            )}

            <div style={{ marginTop: '40px', padding: '24px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '12px' }}>
                Contato da Secretaria
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)' }}>
                  Segunda a Quinta: 8h – 22h | Sexta: 8h – 20h | Sábado e Domingo: 8h – 17h
                </p>
                <a href={FONE_TEL} style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none' }}>
                  {FONE_DISPLAY}
                </a>
                <a href="mailto:secretaria@ipessp.edu.br" style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600, textDecoration: 'none' }}>
                  secretaria@ipessp.edu.br
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
