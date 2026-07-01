'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { EMAIL_CONTATO, EMAIL_HREF } from '@/lib/contato';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { apiFetch } from '../lib/api';

const benefits = [
  {
    title: 'Ambiente Educacional',
    description:
      'Faça parte de uma instituição credenciada pelo MEC com mais de 25 anos de história na área da saúde em São Paulo.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c3 3 9 3 12 0v-5" />
      </svg>
    ),
  },
  {
    title: 'Equipe Qualificada',
    description:
      'Trabalhe ao lado de mestres e doutores apaixonados pelo ensino, pesquisa e pelo avanço da educação em saúde.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    title: 'Crescimento Profissional',
    description:
      'Acesso a cursos, workshops e eventos científicos para desenvolvimento contínuo da sua carreira acadêmica.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    ),
  },
  {
    title: 'Localização Central',
    description:
      'Sede no coração de São Paulo, no bairro da Consolação, com fácil acesso por transporte público.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
  },
  {
    title: 'Impacto Social',
    description:
      'Contribua para a formação de profissionais de saúde que irão atuar em toda a Grande São Paulo e além.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Estrutura Completa',
    description:
      'Laboratórios modernos, clínica escola, biblioteca e anfiteatro: o ambiente ideal para quem ensina e aprende.',
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
];

const vagas = [
  {
    titulo: 'Monitor de Disciplina',
    tipo: 'Edital Aberto',
    descricao:
      'Edital de Monitoria aberto para alunos e ex-alunos interessados em auxiliar na condução de disciplinas práticas e teóricas. Enviar currículo em formato .doc ou .pdf (máx. 2MB) para o e-mail abaixo.',
    destaque: true,
  },
  {
    titulo: 'Professor Convidado / Especialista',
    tipo: 'Banco de Talentos',
    descricao:
      'Recebemos currículos de especialistas com titulação de mestrado ou doutorado interessados em lecionar disciplinas nos cursos de pós-graduação.',
    destaque: false,
  },
  {
    titulo: 'Técnico de Laboratório',
    tipo: 'Banco de Talentos',
    descricao:
      'Buscamos profissionais com experiência em laboratórios de análises clínicas, biomedicina, estética ou farmácia para suporte às atividades práticas.',
    destaque: false,
  },
  {
    titulo: 'Administrativo / Secretaria',
    tipo: 'Banco de Talentos',
    descricao:
      'Oportunidades para profissionais de secretaria, atendimento, financeiro e gestão acadêmica interessados em integrar o time IPESSP.',
    destaque: false,
  },
];

export default function TrabalheConoscoPage() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    area: '',
    mensagem: '',
    arquivo: null as File | null,
  });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setForm(prev => ({ ...prev, arquivo: file }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      const body = new FormData();
      body.append('nome', form.nome);
      body.append('email', form.email);
      body.append('area', form.area);
      if (form.mensagem) body.append('mensagem', form.mensagem);
      if (form.arquivo)  body.append('file', form.arquivo);

      const res = await apiFetch('/v1/candidaturas', {
        method: 'POST',
        body,
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
              Oportunidades
            </p>
            <h1
              style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)' }}
              className="font-bold mb-4"
            >
              Trabalhe Conosco
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', maxWidth: '620px' }}>
              Faça parte do time IPESSP. Credenciados pelo MEC pelo Despacho nº 1272 de 4 de julho de 2019,
              buscamos profissionais comprometidos com a excelência no ensino da saúde.
            </p>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Por que IPESSP
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold mb-4"
              >
                Por que trabalhar no IPESSP?
              </h2>
              <p style={{ color: 'var(--ink-500)', maxWidth: '560px' }} className="mx-auto">
                Uma instituição que valoriza seus colaboradores e oferece um ambiente de trabalho
                estimulante e significativo.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map(benefit => (
                <div
                  key={benefit.title}
                  className="rounded-2xl p-7"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: 'var(--brand-50)', color: 'var(--brand-600)' }}
                  >
                    {benefit.icon}
                  </div>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                    className="font-bold mb-2"
                  >
                    {benefit.title}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div className="text-center mb-12">
              <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                Vagas
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                className="font-bold"
              >
                Oportunidades disponíveis
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vagas.map(vaga => (
                <div
                  key={vaga.titulo}
                  className="rounded-2xl p-7 relative"
                  style={{
                    background: 'var(--surface)',
                    border: vaga.destaque ? '2px solid var(--brand-600)' : '1px solid var(--line)',
                    boxShadow: vaga.destaque ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                  }}
                >
                  {vaga.destaque && (
                    <span
                      className="absolute top-4 right-4 text-xs font-semibold px-3 py-1 rounded-full"
                      style={{ background: 'var(--brand-600)', color: 'white' }}
                    >
                      Edital Aberto
                    </span>
                  )}
                  <span
                    className="inline-block text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full mb-4"
                    style={{
                      background: vaga.destaque ? 'var(--brand-50)' : 'var(--surface-alt)',
                      color: vaga.destaque ? 'var(--brand-700)' : 'var(--ink-500)',
                    }}
                  >
                    {vaga.tipo}
                  </span>
                  <h3
                    style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                    className="font-bold mb-3"
                  >
                    {vaga.titulo}
                  </h3>
                  <p style={{ color: 'var(--ink-500)', fontSize: '0.9375rem', lineHeight: '1.6' }}>
                    {vaga.descricao}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <p style={{ color: 'var(--brand-600)' }} className="text-sm font-semibold uppercase tracking-wider mb-3">
                  Candidatura
                </p>
                <h2
                  style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h2)', color: 'var(--ink-900)' }}
                  className="font-bold mb-3"
                >
                  Envie seu currículo
                </h2>
                <p style={{ color: 'var(--ink-500)' }}>
                  Preencha o formulário abaixo ou envie diretamente para{' '}
                  <a href={EMAIL_HREF} style={{ color: 'var(--brand-600)', fontWeight: 600 }}>
                    {EMAIL_CONTATO}
                  </a>
                </p>
              </div>

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
                    Candidatura enviada!
                  </h3>
                  <p style={{ color: 'var(--ink-500)' }}>
                    Obrigado pelo seu interesse. Nossa equipe irá analisar seu perfil e entrará em contato.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="rounded-2xl p-8 flex flex-col gap-5"
                  style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="nome" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                        Nome completo *
                      </label>
                      <input
                        id="nome"
                        name="nome"
                        type="text"
                        required
                        value={form.nome}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        className="rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--line)',
                          color: 'var(--ink-900)',
                        }}
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
                        className="rounded-xl px-4 py-3 text-sm outline-none transition-all"
                        style={{
                          background: 'var(--surface)',
                          border: '1px solid var(--line)',
                          color: 'var(--ink-900)',
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="area" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Área de interesse *
                    </label>
                    <select
                      id="area"
                      name="area"
                      required
                      value={form.area}
                      onChange={handleChange}
                      className="rounded-xl px-4 py-3 text-sm outline-none transition-all"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        color: form.area ? 'var(--ink-900)' : 'var(--ink-500)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                    >
                      <option value="">Selecione uma área</option>
                      <option value="monitoria">Monitoria</option>
                      <option value="docencia">Docência / Professor Convidado</option>
                      <option value="laboratorio">Técnico de Laboratório</option>
                      <option value="administrativo">Administrativo / Secretaria</option>
                      <option value="outro">Outro</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="mensagem" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Mensagem
                    </label>
                    <textarea
                      id="mensagem"
                      name="mensagem"
                      rows={4}
                      value={form.mensagem}
                      onChange={handleChange}
                      placeholder="Fale um pouco sobre você e sua experiência..."
                      className="rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink-900)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; }}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="arquivo" style={{ color: 'var(--ink-700)', fontSize: '0.875rem', fontWeight: 600 }}>
                      Currículo (.doc ou .pdf, máx. 2MB)
                    </label>
                    <input
                      id="arquivo"
                      name="arquivo"
                      type="file"
                      accept=".doc,.docx,.pdf"
                      onChange={handleFile}
                      className="rounded-xl px-4 py-3 text-sm"
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--line)',
                        color: 'var(--ink-700)',
                      }}
                    />
                    {form.arquivo && (
                      <p style={{ color: 'var(--brand-600)', fontSize: '0.8125rem' }}>
                        Arquivo selecionado: {form.arquivo.name}
                      </p>
                    )}
                  </div>
                  {erro && (
                    <p style={{ color: '#b81f1f', fontSize: '0.875rem', background: '#fdf2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                      {erro}
                    </p>
                  )}
                  <button type="submit" disabled={enviando} className="btn btn-primary w-full justify-center" style={{ opacity: enviando ? 0.7 : 1 }}>
                    {enviando ? 'Enviando...' : 'Enviar candidatura'}
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
