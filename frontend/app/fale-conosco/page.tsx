'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { apiFetch } from '../lib/api';
import {
  FONE_DISPLAY, FONE_TEL, WHATSAPP_URL, EMAIL_CONTATO,
  ENDERECO_RUA, ENDERECO_BAIRRO, ENDERECO_CEP,
} from '@/lib/contato';

const canaisContato = [
  {
    titulo: 'Central de Atendimento ao Aluno (CAA)',
    descricao: 'Notas, matrícula, contratos, faltas e problemas de acesso/login.',
    tel: '(11) 99773-8431',
    telHref: 'tel:+5511997738431',
    whatsappHref: 'https://wa.me/5511997738431',
    email: 'caa@ipessp.edu.br',
  },
  {
    titulo: 'Financeiro',
    descricao: 'Boletos, parcelamento, rematrícula e declarações.',
    tel: '(11) 99839-3640',
    telHref: 'tel:+5511998393640',
    whatsappHref: null,
    email: 'matricula.financeiro@ipessp.edu.br',
  },
  {
    titulo: 'Clínica Escola',
    descricao: 'Agendamento de procedimentos estéticos com paciente-modelo.',
    tel: '(11) 91263-0071',
    telHref: 'tel:+5511912630071',
    whatsappHref: 'https://wa.me/5511912630071',
    email: 'clinicaescola@ipessp.edu.br',
  },
  {
    titulo: 'Comercial (novos alunos)',
    descricao: 'Informações de cursos, inscrição e datas de início.',
    tel: '(11) 97692-2127',
    telHref: 'tel:+5511976922127',
    whatsappHref: 'https://wa.me/5511976922127',
    email: 'comercial4@ipessp.edu.br',
  },
  {
    titulo: 'Geral',
    descricao: 'Demais assuntos institucionais.',
    tel: FONE_DISPLAY,
    telHref: FONE_TEL,
    whatsappHref: WHATSAPP_URL,
    email: EMAIL_CONTATO,
  },
];

const inputStyle = {
  width: '100%',
  padding: '14px 16px',
  border: '2px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--fs-sm)',
  color: 'var(--ink-900)',
  background: 'var(--surface)',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export default function FaleConosco() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
  const [whatsappOptin, setWhatsappOptin] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      const res = await apiFetch('/v1/mensagens-contato', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        setErro(data.error ?? 'Erro ao enviar. Tente novamente.');
        return;
      }
      // Cria lead em background — não bloqueia nem exibe erro ao usuário
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: form.nome,
          email: form.email,
          telefone: form.telefone || undefined,
          observacao: [form.assunto, form.mensagem].filter(Boolean).join(' — ') || undefined,
          whatsappOptin,
          origem: 'site',
        }),
      }).catch(() => {});
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
              Atendimento
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Fale Conosco
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '580px', lineHeight: 'var(--lh-body)' }}>
              Nossa equipe está disponível para esclarecer dúvidas sobre cursos, matrículas e financeiro. Entre em contato pelo canal que preferir.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Informações
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '36px' }}>
                  Entre em Contato
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
                  {canaisContato.map((canal) => (
                    <div
                      key={canal.titulo}
                      style={{ padding: '18px 22px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}
                    >
                      <p style={{ color: 'var(--ink-900)', fontSize: '0.9375rem', fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: '3px' }}>
                        {canal.titulo}
                      </p>
                      <p style={{ color: 'var(--ink-500)', fontSize: '0.8125rem', marginBottom: '10px' }}>
                        {canal.descricao}
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 20px', fontSize: 'var(--fs-sm)' }}>
                        <a href={canal.telHref} style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                          {canal.tel}
                        </a>
                        {canal.whatsappHref && (
                          <a href={canal.whatsappHref} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                            WhatsApp
                          </a>
                        )}
                        <a href={`mailto:${canal.email}`} style={{ color: 'var(--brand-600)', fontWeight: 600, textDecoration: 'none' }}>
                          {canal.email}
                        </a>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ padding: '28px', background: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '8px' }}>
                      Endereço
                    </h3>
                    <address style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)', fontStyle: 'normal' }}>
                      {ENDERECO_RUA}<br />
                      {ENDERECO_BAIRRO}<br />
                      {ENDERECO_CEP}
                    </address>
                  </div>
                  <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '10px' }}>
                      Horários de Atendimento
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { dia: 'Segunda a Quinta', hora: '8h – 22h' },
                        { dia: 'Sexta-feira', hora: '8h – 20h' },
                        { dia: 'Sábado e Domingo', hora: '8h – 17h' },
                      ].map(h => (
                        <div key={h.dia} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', fontSize: 'var(--fs-sm)' }}>
                          <span style={{ color: 'var(--ink-700)' }}>{h.dia}</span>
                          <span style={{ fontWeight: 700, color: 'var(--ink-900)' }}>{h.hora}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Formulário
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '36px' }}>
                  Envie uma Mensagem
                </h2>

                {enviado ? (
                  <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)', border: '2px solid var(--brand-600)', padding: '3rem', textAlign: 'center' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 'var(--fs-h3)', color: 'var(--ink-900)', marginBottom: '0.5rem' }}>
                      Mensagem enviada!
                    </h3>
                    <p style={{ color: 'var(--ink-500)' }}>
                      Recebemos sua mensagem e entraremos em contato em breve.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        name="nome"
                        required
                        value={form.nome}
                        onChange={handleChange}
                        placeholder="Seu nome completo"
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                          E-mail *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                          Telefone
                        </label>
                        <input
                          type="tel"
                          name="telefone"
                          value={form.telefone}
                          onChange={handleChange}
                          placeholder="(11) 99999-9999"
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                        Assunto *
                      </label>
                      <select
                        name="assunto"
                        required
                        value={form.assunto}
                        onChange={handleChange}
                        style={inputStyle}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      >
                        <option value="">Selecione o assunto</option>
                        <option value="matriculas">Matrículas</option>
                        <option value="pos-graduacao">Pós-Graduação</option>
                        <option value="financeiro">Financeiro</option>
                        <option value="outros">Outros</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', fontWeight: 600, marginBottom: '8px' }}>
                        Mensagem *
                      </label>
                      <textarea
                        name="mensagem"
                        required
                        value={form.mensagem}
                        onChange={handleChange}
                        placeholder="Escreva sua mensagem aqui..."
                        rows={6}
                        style={{ ...inputStyle, resize: 'vertical', fontFamily: 'var(--font-body)' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={whatsappOptin}
                        onChange={e => setWhatsappOptin(e.target.checked)}
                        style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: 'var(--brand-600)' }}
                      />
                      <span style={{ color: 'var(--ink-500)', fontSize: '0.8rem' }}>
                        Aceito receber novidades e contato sobre cursos pelo WhatsApp
                      </span>
                    </label>
                    {erro && (
                      <p style={{ color: '#b81f1f', fontSize: '0.875rem', background: '#fdf2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                        {erro}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={enviando}
                      className="btn btn-primary"
                      style={{ alignSelf: 'flex-start', opacity: enviando ? 0.7 : 1 }}
                    >
                      {enviando ? 'Enviando...' : 'Enviar mensagem'}
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                      </svg>
                    </button>
                  </form>
                )}
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
