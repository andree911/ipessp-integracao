'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { apiFetch } from '../lib/api';

const espacos = [
  {
    icone: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    nome: 'Anfiteatro Principal',
    capacidade: '180 pessoas',
    descricao: 'Espaço amplo e moderno ideal para congressos, simpósios, palestras e grandes eventos acadêmicos. Equipado com sistema audiovisual de última geração, telão de projeção duplo, sonorização profissional e iluminação cênica.',
    recursos: ['Sistema de som profissional', 'Dois telões de projeção', 'Transmissão ao vivo', 'Filmagem inclusa', 'Ar-condicionado central', 'Acessibilidade total'],
  },
  {
    icone: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="9" y1="21" x2="9" y2="9"/>
      </svg>
    ),
    nome: 'Anfiteatro Secundário',
    capacidade: '80 pessoas',
    descricao: 'Perfeito para workshops, treinamentos corporativos, defesas de tese e eventos de médio porte. Conta com projetor fixo, quadro branco interativo e mobiliário configurável para diferentes formatos.',
    recursos: ['Projetor de alta resolução', 'Quadro interativo', 'Mobiliário flexível', 'Microfone sem fio', 'Ar-condicionado', 'Acesso independente'],
  },
  {
    icone: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    nome: 'Salas de Reunião e Workshop',
    capacidade: 'Até 40 pessoas cada',
    descricao: '10 salas de aula modernas disponíveis para cursos de extensão, workshops, treinamentos e reuniões corporativas. Cada sala é equipada com ar-condicionado, projetor e internet de alta velocidade.',
    recursos: ['10 salas disponíveis', 'Projetor individual', 'Internet fibra óptica', 'Ar-condicionado', 'Lousa e pincel', 'Configuração personalizável'],
  },
  {
    icone: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    nome: 'Laboratórios para Demonstrações',
    capacidade: 'Até 30 pessoas',
    descricao: '5 laboratórios especializados que podem ser utilizados para demonstrações práticas, cursos técnicos e treinamentos com equipamentos reais. Ideal para eventos científicos na área da saúde.',
    recursos: ['Equipamentos biomédicos reais', '5 laboratórios temáticos', 'Proteção e EPI disponíveis', 'Supervisão técnica', 'Bancadas equipadas', 'Climatização controlada'],
  },
];

const diferenciais = [
  {
    icone: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M17.5 19H9a7 7 0 110-14h8.5"/>
        <path d="M15 5l4 4-4 4"/>
      </svg>
    ),
    titulo: 'Localização Central',
    texto: 'A 5 minutos do metrô Consolação e Paulista, no coração de São Paulo, com fácil acesso por transporte público.',
  },
  {
    icone: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
        <line x1="8" y1="21" x2="16" y2="21"/>
        <line x1="12" y1="17" x2="12" y2="21"/>
      </svg>
    ),
    titulo: 'Estrutura Tecnológica',
    texto: 'Transmissão ao vivo, streaming, sistemas audiovisuais profissionais e internet de alta velocidade em todo o espaço.',
  },
  {
    icone: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
        <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/>
      </svg>
    ),
    titulo: 'Suporte Completo',
    texto: 'Equipe técnica e de apoio disponível durante todo o evento. Secretaria, recepção e apoio logístico inclusos.',
  },
  {
    icone: (
      <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10z"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
    titulo: 'Disponibilidade Ampla',
    texto: 'Atendimento de segunda a domingo, com horários flexíveis para atender as necessidades do seu evento.',
  },
];

export default function EspacoParaEventos() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', tipoEvento: '', descricao: '' });
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
      const res = await apiFetch('/v1/solicitacoes-eventos', {
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
          <div className="container-site">
            <p style={{ color: 'var(--accent-400)', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
              Institucional
            </p>
            <h1 style={{ color: 'white', fontFamily: 'var(--font-display)', fontSize: 'var(--fs-display)', fontWeight: 700, lineHeight: 'var(--lh-tight)', maxWidth: '680px', marginBottom: '20px' }}>
              Espaço para Eventos
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'var(--fs-body)', maxWidth: '600px', lineHeight: 'var(--lh-body)' }}>
              4.000 m² de infraestrutura moderna no coração de São Paulo para congressos, simpósios, workshops e eventos corporativos na área da saúde.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '28px' }}>
              <a href="https://wa.me/5511976922127" target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Solicitar orçamento
              </a>
              <a href="mailto:marketing@ipessp.edu.br" className="btn btn-white">
                Enviar e-mail
              </a>
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(48px,6vw,72px)' }}>
              <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                Conheça os espaços
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '16px' }}>
                Ambientes para cada tipo de evento
              </h2>
              <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', maxWidth: '580px', margin: '0 auto' }}>
                Desde pequenos workshops até grandes congressos, o IPESSP tem o espaço ideal para o seu evento na área da saúde.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {espacos.map((e) => (
                <div
                  key={e.nome}
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--line)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div style={{ background: 'var(--brand-900)', padding: '28px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-400)', flexShrink: 0 }}>
                      {e.icone}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 'var(--fs-h3)', marginBottom: '4px' }}>
                        {e.nome}
                      </h3>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(233,185,73,0.15)', color: 'var(--accent-400)', borderRadius: 'var(--radius-pill)', padding: '3px 12px', fontSize: '0.8rem', fontWeight: 600 }}>
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                        </svg>
                        {e.capacidade}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                    <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                      {e.descricao}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: 'auto' }}>
                      {e.recursos.map((r) => (
                        <span key={r} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-pill)', padding: '4px 10px', fontSize: '0.75rem', color: 'var(--ink-700)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <svg width="10" height="10" fill="var(--brand-600)" viewBox="0 0 24 24">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface-alt)' }}>
          <div className="container-site">
            <div style={{ textAlign: 'center', marginBottom: 'clamp(40px,5vw,60px)' }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '12px' }}>
                Por que escolher o IPESSP?
              </h2>
              <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-body)', lineHeight: 'var(--lh-body)', maxWidth: '520px', margin: '0 auto' }}>
                Infraestrutura completa com suporte profissional para garantir o sucesso do seu evento.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
              {diferenciais.map((d) => (
                <div key={d.titulo} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', padding: '28px 24px', border: '1px solid var(--line)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)' }}>
                    {d.icone}
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-h3)' }}>
                    {d.titulo}
                  </h3>
                  <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                    {d.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-gap" style={{ background: 'var(--surface)' }}>
          <div className="container-site">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,80px)', alignItems: 'start' }} className="contact-grid">
              <div>
                <p style={{ color: 'var(--brand-600)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: 'var(--fs-sm)', marginBottom: '10px' }}>
                  Solicite uma visita
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--fs-h1)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '24px' }}>
                  Entre em contato
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', marginBottom: '4px' }}>Endereço</p>
                      <p style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                        Rua Dona Antônia de Queirós, 333<br />
                        Consolação — São Paulo/SP<br />
                        CEP: 01307-012
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 014.13 11 19.79 19.79 0 011.07 2.36 2 2 0 013.06 0h3a2 2 0 012 1.72c.12.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.58 2.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', marginBottom: '4px' }}>Telefone / WhatsApp</p>
                      <a href="tel:+5511976922127" style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                        (11) 97692-2127
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', marginBottom: '4px' }}>E-mail</p>
                      <a href="mailto:marketing@ipessp.edu.br" style={{ color: 'var(--brand-600)', fontSize: 'var(--fs-sm)', fontWeight: 600 }}>
                        marketing@ipessp.edu.br
                      </a>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: 'var(--radius-sm)', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-600)', flexShrink: 0 }}>
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-sm)', marginBottom: '4px' }}>Horários</p>
                      <div style={{ color: 'var(--ink-700)', fontSize: 'var(--fs-sm)', lineHeight: 'var(--lh-body)' }}>
                        <p>Segunda a Quinta: 8h – 22h</p>
                        <p>Sexta-feira: 8h – 20h</p>
                        <p>Sábado e Domingo: 8h – 17h</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-lg)', padding: 'clamp(28px,4vw,48px)', border: '1px solid var(--line)' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink-900)', fontSize: 'var(--fs-h3)', marginBottom: '24px' }}>
                  Solicitar informações
                </h3>
                {enviado ? (
                  <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--brand-50)', color: 'var(--brand-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M20 6 9 17l-5-5"/>
                      </svg>
                    </div>
                    <h4 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--ink-900)', marginBottom: '0.5rem' }}>Solicitação enviada!</h4>
                    <p style={{ color: 'var(--ink-500)', fontSize: 'var(--fs-sm)' }}>Entraremos em contato em breve com mais informações.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>Nome completo *</label>
                      <input
                        type="text"
                        name="nome"
                        required
                        value={form.nome}
                        onChange={handleChange}
                        placeholder="Seu nome"
                        style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>E-mail *</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>Telefone / WhatsApp</label>
                      <input
                        type="tel"
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        placeholder="(11) 9xxxx-xxxx"
                        style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', width: '100%' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>Tipo de evento *</label>
                      <select
                        name="tipoEvento"
                        required
                        value={form.tipoEvento}
                        onChange={handleChange}
                        style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', width: '100%', cursor: 'pointer' }}
                      >
                        <option value="">Selecione...</option>
                        <option value="congresso">Congresso / Simpósio</option>
                        <option value="workshop">Workshop / Curso</option>
                        <option value="treinamento">Treinamento Corporativo</option>
                        <option value="defesa">Defesa de Tese / Banca</option>
                        <option value="outro">Outro</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: 'var(--fs-sm)', fontWeight: 600, color: 'var(--ink-700)' }}>Mensagem</label>
                      <textarea
                        name="descricao"
                        value={form.descricao}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Descreva seu evento: data prevista, número de participantes e necessidades específicas..."
                        style={{ border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '12px 14px', fontSize: 'var(--fs-sm)', color: 'var(--ink-900)', background: 'var(--surface)', outline: 'none', width: '100%', resize: 'vertical', fontFamily: 'var(--font-body)' }}
                      />
                    </div>
                    {erro && (
                      <p style={{ color: '#b81f1f', fontSize: '0.875rem', background: '#fdf2f2', border: '1px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '10px 14px' }}>
                        {erro}
                      </p>
                    )}
                    <button type="submit" disabled={enviando} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '4px', opacity: enviando ? 0.7 : 1 }}>
                      {enviando ? 'Enviando...' : 'Enviar solicitação'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            <style>{`
              @media (max-width: 768px) {
                .contact-grid { grid-template-columns: 1fr !important; }
              }
            `}</style>
          </div>
        </section>

        <section style={{ background: 'var(--brand-900)' }} className="py-16">
          <div className="container-site">
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,4vw,48px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-400)', flexShrink: 0 }}>
                  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'white', fontSize: 'var(--fs-h3)', marginBottom: '6px' }}>
                    Rua Dona Antônia de Queirós, 333
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--fs-sm)' }}>
                    Consolação — São Paulo/SP — CEP: 01307-012
                  </p>
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '6px' }}>
                    Próximo ao metrô Consolação (linha 2-verde) e metrô Paulista (linha 4-amarela)
                  </p>
                </div>
              </div>
              <a
                href="https://maps.google.com/?q=Rua+Dona+Antônia+de+Queirós,+333,+Consolação,+São+Paulo"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-white"
                style={{ flexShrink: 0 }}
              >
                Ver no Google Maps
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
