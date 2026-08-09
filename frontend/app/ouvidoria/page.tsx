'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { apiFetch } from '../lib/api';

const tiposContato = [
  { value: 'reclamacao', label: 'Reclamação' },
  { value: 'sugestao', label: 'Sugestão' },
  { value: 'elogio', label: 'Elogio' },
  { value: 'outro', label: 'Outros' },
];

const diferenciais = [
  {
    title: 'Sigilo Garantido',
    description: 'Todas as mensagens são tratadas com total confidencialidade. Sua identidade é protegida em todo o processo.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0110 0v4" />
      </svg>
    ),
  },
  {
    title: 'Prazo de 5 Dias Úteis',
    description: 'Todas as manifestações recebem retorno em até 5 dias úteis, garantindo agilidade e respeito ao solicitante.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: 'Canal Oficial',
    description: 'A ouvidoria é o canal formal de comunicação entre a comunidade acadêmica e a gestão institucional do IPESSP.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>
    ),
  },
];

export default function OuvidoriaPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    tipo: '',
    mensagem: '',
  });
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
      const res = await apiFetch('/v1/manifestacoes', {
        method: 'POST',
        body: JSON.stringify(form),
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
          <div className="container-site text-white">
            <p style={{ color: 'var(--accent-400)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
              Institucional
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)' }}
              className="font-bold mb-4"
            >
              Ouvidoria IPESSP
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Canal oficial para reclamações, sugestões e elogios. Sua voz é importante para a
              melhoria contínua dos nossos serviços educacionais.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {diferenciais.map(d => (
                <div
                  key={d.title}
                  className="rounded-2xl p-7 text-center"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                  >
                    {d.icon}
                  </div>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                    className="font-bold mb-2"
                  >
                    {d.title}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    {d.description}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Formulário
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                  className="font-bold mb-8"
                >
                  Envie sua manifestação
                </h2>

                {enviado ? (
                  <div
                    className="rounded-2xl p-10 text-center"
                    style={{ background: 'var(--surface-alt)', border: '2px solid var(--brand-600)' }}
                  >
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                      style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                    >
                      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </div>
                    <h3
                      style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                      className="font-bold mb-2"
                    >
                      Manifestação recebida!
                    </h3>
                    <p style={{ color: 'var(--ink-500)' }}>
                      Sua mensagem foi registrada. Responderemos em até 5 dias úteis.
                    </p>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-5"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="nome" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                          Nome *
                        </label>
                        <input
                          id="nome"
                          name="nome"
                          type="text"
                          required
                          value={form.nome}
                          onChange={handleChange}
                          placeholder="Seu nome"
                          className="rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', color: 'var(--ink-900)' }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="email" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                          E-mail *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="seu@email.com"
                          className="rounded-xl px-4 py-3 text-sm outline-none"
                          style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', color: 'var(--ink-900)' }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="tipo" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                        Tipo de manifestação *
                      </label>
                      <select
                        id="tipo"
                        name="tipo"
                        required
                        value={form.tipo}
                        onChange={handleChange}
                        className="rounded-xl px-4 py-3 text-sm outline-none"
                        style={{
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--line)',
                          color: form.tipo ? 'var(--ink-900)' : 'var(--ink-500)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      >
                        <option value="">Selecione o tipo</option>
                        {tiposContato.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="mensagem" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                        Mensagem *
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        rows={5}
                        required
                        value={form.mensagem}
                        onChange={handleChange}
                        placeholder="Descreva sua manifestação com o máximo de detalhes possível..."
                        className="rounded-xl px-4 py-3 text-sm outline-none resize-none"
                        style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)', color: 'var(--ink-900)' }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      />
                    </div>
                    {erro && (
                      <p style={{ color: '#b81f1f', fontSize: '0.875rem', background: '#fdf2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                        {erro}
                      </p>
                    )}
                    <button type="submit" disabled={enviando} className="btn btn-primary w-full justify-center" style={{ opacity: enviando ? 0.7 : 1 }}>
                      {enviando ? 'Enviando...' : 'Enviar manifestação'}
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>

              <div className="lg:col-span-2">
                <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Contato Alternativo
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                  className="font-bold mb-6"
                >
                  Outros canais
                </h2>
                <div className="flex flex-col gap-5">
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ color: 'var(--ink-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }} className="mb-1">
                          E-mail
                        </p>
                        <a href="mailto:marketing@ipessp.edu.br" style={{ color: 'var(--ink-900)', fontWeight: 600, fontSize: '0.9375rem' }}>
                          marketing@ipessp.edu.br
                        </a>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ color: 'var(--ink-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }} className="mb-1">
                          Telefone
                        </p>
                        <a href="tel:+5511976922127" style={{ color: 'var(--ink-900)', fontWeight: 600, fontSize: '0.9375rem' }}>
                          (11) 97692-2127
                        </a>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                      >
                        <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                      </div>
                      <div>
                        <p style={{ color: 'var(--ink-500)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }} className="mb-1">
                          Correspondência
                        </p>
                        <address style={{ color: 'var(--ink-900)', fontSize: '0.9375rem', lineHeight: '1.6' }} className="not-italic">
                          Rua Dona Antônia de Queirós, 333<br />
                          Consolação – São Paulo/SP<br />
                          CEP: 01307-012
                        </address>
                      </div>
                    </div>
                  </div>
                  <div
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--brand-50)', border: '1px solid var(--brand-100)' }}
                  >
                    <p style={{ color: 'var(--brand-700)', fontSize: '0.875rem', lineHeight: '1.6' }}>
                      <strong>Prazo de resposta:</strong> Todas as manifestações são respondidas
                      em até <strong>5 dias úteis</strong>. O sigilo é garantido em todo o processo.
                    </p>
                  </div>
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
