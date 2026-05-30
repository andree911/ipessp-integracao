'use client';

import { useState } from 'react';

/* Cursos reais de ipessp.edu.br organizados por grupo */
const cursoGroups = [
  {
    label: 'Graduação',
    options: ['Gestão Hospitalar', 'Biomedicina', 'Estética e Cosmética', 'Fisioterapia'],
  },
  {
    label: 'Pós-Graduação – Cardiologia',
    options: [
      'Circulação Extracorpórea – Perfusão',
      'Curso Introdutório de Circulação Extracorpórea',
      'ECMO Básico para Equipe Multidisciplinar',
    ],
  },
  {
    label: 'Pós-Graduação – Diagnóstico Laboratorial',
    options: [
      'Análises Clínicas – Da Prática à Clínica',
      'Citogenética Clínica',
      'Biologia Molecular',
      'Citologia Clínica',
      'Imunologia e Oncohematologia',
      'Microbiologia Clínica',
      'Hematologia e Hemoterapia Laboratorial',
    ],
  },
  {
    label: 'Pós-Graduação – Estética',
    options: [
      'Biomedicina Estética Avançada',
      'Farmácia Estética Avançada',
      'Biologia Estética Avançada',
      'Enfermagem Estética',
      'Harmonização Orofacial (HOF)',
    ],
  },
  {
    label: 'Pós-Graduação – Gestão em Saúde',
    options: [
      'Administração Hospitalar – Online ao Vivo',
      'Auditoria nos Serviços de Saúde',
      'Saúde Pública e Estratégia em Saúde da Família',
      'Direito da Saúde',
    ],
  },
  {
    label: 'Pós-Graduação – Farmácia',
    options: [
      'Farmácia Clínica e Atenção Farmacêutica – EAD',
      'Farmácia Oncológica – Online c/ Estágio na FMUSP',
    ],
  },
  {
    label: 'Pós-Graduação – Enfermagem',
    options: [
      'Enfermagem Estética',
      'Enfermagem Intensiva Pediátrica e Neonatal',
      'Enfermagem Intensiva Adulto',
    ],
  },
  {
    label: 'Pós-Graduação – Outras Áreas',
    options: [
      'Acupuntura Integrativa – Medicina Chinesa',
      'Análises Clínicas Veterinária',
      'Docência e Pesquisa em Ciências e Saúde',
      'Gerontologia – 40% EAD',
      'Ressonância Magnética e Tomografia Computadorizada',
      'MBA em Saúde',
    ],
  },
  {
    label: 'Cursos Livres',
    options: [
      'Análises Clínicas – Capacitação',
      'Atualização em Estética',
      'Atualização em Fisioterapia',
      'Atualização em Análises Clínicas',
      'Técnico Veterinário',
    ],
  },
  {
    label: 'Outro',
    options: ['Não sei ainda / Quero orientação'],
  },
];

export default function CTAFinal() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', curso: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setSent(true);
    setLoading(false);
  };

  return (
    <section
      id="pre-inscricao"
      className="section-gap relative overflow-hidden"
      style={{ background: 'var(--brand-700)' }}
    >
      {/* Decorative shapes */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10 -mr-32 -mt-32"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        aria-hidden
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10 -ml-20 -mb-20"
        style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }}
        aria-hidden
      />

      <div className="container-site relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left */}
          <div className="text-white">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 opacity-75"
            >
              Comece sua jornada
            </p>
            <h2
              className="font-bold mb-4 text-white leading-tight"
              style={{
                fontFamily: 'var(--font-sora, var(--font-display))',
                fontSize: 'var(--fs-h1)',
                lineHeight: 'var(--lh-tight)',
              }}
            >
              A excelência está a um clique de distância
            </h2>
            <p className="text-white/80 mb-8 leading-relaxed" style={{ fontSize: 'var(--fs-body)' }}>
              Preencha o formulário e nossa equipe entrará em contato para orientar você sobre
              os cursos, processo seletivo e condições de matrícula.
            </p>
            <ul className="flex flex-col gap-3">
              {[
                'Atendimento personalizado',
                'Processo seletivo simplificado',
                'Bolsas e condições especiais',
                'Resposta em até 24 horas',
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-white/90">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Form card */}
          <div
            className="bg-white rounded-2xl p-8"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            {sent ? (
              <div className="text-center py-8">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: 'var(--brand-50)' }}
                >
                  <svg width="32" height="32" fill="none" stroke="var(--brand-600)" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{ fontFamily: 'var(--font-sora)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                >
                  Recebemos seu interesse!
                </h3>
                <p style={{ color: 'var(--ink-500)' }}>
                  Nossa equipe entrará em contato em breve. Fique atento ao seu e-mail e telefone.
                </p>
              </div>
            ) : (
              <>
                <h3
                  className="font-bold mb-1"
                  style={{ fontFamily: 'var(--font-sora)', fontSize: 'var(--fs-h3)', color: 'var(--ink-900)' }}
                >
                  Pré-Inscrição Gratuita
                </h3>
                <p className="mb-6 text-sm" style={{ color: 'var(--ink-500)' }}>
                  Sem compromisso. Nossa equipe esclarece todas as suas dúvidas.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Nome */}
                  <div>
                    <label
                      htmlFor="nome"
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--ink-700)' }}
                    >
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
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{
                        borderColor: 'var(--line)',
                        color: 'var(--ink-900)',
                        background: 'var(--surface-alt)',
                      }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--ink-700)' }}
                    >
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
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink-900)', background: 'var(--surface-alt)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Telefone */}
                  <div>
                    <label
                      htmlFor="telefone"
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--ink-700)' }}
                    >
                      Telefone / WhatsApp *
                    </label>
                    <input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      required
                      value={form.telefone}
                      onChange={handleChange}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: 'var(--line)', color: 'var(--ink-900)', background: 'var(--surface-alt)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
                    />
                  </div>

                  {/* Curso */}
                  <div>
                    <label
                      htmlFor="curso"
                      className="block text-sm font-medium mb-1"
                      style={{ color: 'var(--ink-700)' }}
                    >
                      Curso de interesse *
                    </label>
                    <select
                      id="curso"
                      name="curso"
                      required
                      value={form.curso}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all appearance-none"
                      style={{ borderColor: 'var(--line)', color: form.curso ? 'var(--ink-900)' : 'var(--ink-500)', background: 'var(--surface-alt)' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-600)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <option value="">Selecione um curso</option>
                      {cursoGroups.map(group => (
                        <optgroup key={group.label} label={group.label}>
                          {group.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full justify-center text-base py-3.5 mt-1"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Enviando...
                      </>
                    ) : 'Quero ser aluno IPESSP'}
                  </button>

                  <p className="text-xs text-center" style={{ color: 'var(--ink-300)' }}>
                    Ao enviar, você concorda com nossa{' '}
                    <a href="#" className="underline" style={{ color: 'var(--ink-500)' }}>
                      Política de Privacidade
                    </a>
                    .
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
