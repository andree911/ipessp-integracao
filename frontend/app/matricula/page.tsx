'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── helpers de estilo ────────────────────────────────────────────────────────

const inputCls = 'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all';
const inputStyle = { borderColor: 'var(--line)', color: 'var(--ink-900)', background: 'var(--surface-alt)' };
const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--brand-600)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)';
    e.currentTarget.style.background = 'white';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = 'var(--line)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = 'var(--surface-alt)';
  },
};

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-700)' }}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{error}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} style={inputStyle} {...focusHandlers} {...props} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={inputCls} style={inputStyle} {...focusHandlers} {...props} />
  );
}

// ── estado inicial ───────────────────────────────────────────────────────────

const STEPS = ['Aluno', 'Responsável', 'Curso', 'Pagamento'];

const initAluno = { nome: '', cpf: '', email: '', telefone: '', sexo: 'M', dataNascimento: '' };
const initResp  = { nome: '', cpf: '', email: '', telefone: '', tipoParentesco: '1' };
const initCurso = { curso: '', unidade: '', turno: 'Manhã', periodoLetivo: '', curriculo: '' };
const initPlano = { numeroParcelas: '1', valorParcela: '', dataPrimeiraParcela: '', desconto: '' };

// ── componente principal ─────────────────────────────────────────────────────

export default function MatriculaPage() {
  const [step, setStep] = useState(0);
  const [temResponsavel, setTemResponsavel] = useState(false);
  const [aluno, setAluno] = useState(initAluno);
  const [resp, setResp]   = useState(initResp);
  const [curso, setCurso] = useState(initCurso);
  const [plano, setPlano] = useState(initPlano);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [result, setResult] = useState<{
    codigoAluno: number;
    pagamento: { linkPagamento: string; linkSandbox: string } | null;
  } | null>(null);

  const set = (setter: typeof setAluno) => (field: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setter(prev => ({ ...prev, [field]: e.target.value }));

  // ── validações por step ────────────────────────────────────────────────────

  function validateStep(): boolean {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!aluno.nome.trim()) e.nome = 'Nome é obrigatório.';
      if (!aluno.cpf.replace(/\D/g, '')) e.cpf = 'CPF é obrigatório.';
    }
    if (step === 1 && temResponsavel) {
      if (!resp.nome.trim()) e.respNome = 'Nome do responsável é obrigatório.';
      if (!resp.cpf.replace(/\D/g, '')) e.respCpf = 'CPF do responsável é obrigatório.';
    }
    if (step === 2) {
      if (!curso.curso.trim()) e.curso = 'Curso é obrigatório.';
      if (!curso.unidade.trim()) e.unidade = 'Unidade é obrigatória.';
      if (!curso.periodoLetivo.trim()) e.periodoLetivo = 'Período letivo é obrigatório.';
    }
    if (step === 3) {
      if (!plano.valorParcela || Number(plano.valorParcela) <= 0) e.valorParcela = 'Valor da parcela é obrigatório.';
      if (!plano.dataPrimeiraParcela) e.dataPrimeiraParcela = 'Data da 1ª parcela é obrigatória.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── navegação ──────────────────────────────────────────────────────────────

  function next() { if (validateStep()) setStep(s => s + 1); }
  function back() { setStep(s => s - 1); setErrors({}); }

  // ── submissão ──────────────────────────────────────────────────────────────

  async function handleSubmit() {
    if (!validateStep()) return;
    setLoading(true);
    setServerError('');
    try {
      const body: Record<string, unknown> = {
        aluno: {
          nome: aluno.nome.trim(),
          cpf: aluno.cpf.replace(/\D/g, ''),
          email: aluno.email.trim() || undefined,
          telefone: aluno.telefone.replace(/\D/g, '') || undefined,
          sexo: aluno.sexo as 'M' | 'F',
          dataNascimento: aluno.dataNascimento || undefined,
        },
        curso: {
          curso: curso.curso.trim(),
          unidade: curso.unidade.trim(),
          turno: curso.turno,
          periodoLetivo: curso.periodoLetivo.trim(),
          curriculo: curso.curriculo.trim() || undefined,
        },
        planoPagamento: {
          numeroParcelas: Number(plano.numeroParcelas),
          valorParcela: Number(plano.valorParcela),
          dataPrimeiraParcela: plano.dataPrimeiraParcela,
          desconto: plano.desconto.trim() || undefined,
        },
      };

      if (temResponsavel) {
        body.responsavel = {
          nome: resp.nome.trim(),
          cpf: resp.cpf.replace(/\D/g, ''),
          email: resp.email.trim() || undefined,
          telefone: resp.telefone.replace(/\D/g, '') || undefined,
          tipoParentesco: Number(resp.tipoParentesco),
        };
      }

      const res = await fetch('/api/matriculas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data?.message ?? 'Erro ao registrar matrícula. Tente novamente.');
        return;
      }
      setResult(data);
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // ── tela de sucesso ────────────────────────────────────────────────────────

  if (result) {
    const link = result.pagamento?.linkSandbox || result.pagamento?.linkPagamento;
    return (
      <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-alt)' }}>
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--brand-50)' }}>
            <svg width="32" height="32" fill="none" stroke="var(--brand-600)" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-900)' }}>
            Matrícula registrada!
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--ink-500)' }}>
            Código do aluno no sistema: <strong style={{ color: 'var(--ink-900)' }}>#{result.codigoAluno}</strong>
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--ink-500)' }}>
            O setor financeiro foi notificado e irá configurar seu plano de pagamento. Você receberá mais informações em breve.
          </p>
          {link ? (
            <a href={link} target="_blank" rel="noopener noreferrer" className="btn btn-primary w-full justify-center py-3.5 mb-3 block">
              Pagar 1ª parcela agora
            </a>
          ) : (
            <p className="text-sm mb-3 p-3 rounded-xl" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)' }}>
              Link de pagamento não disponível. O financeiro entrará em contato.
            </p>
          )}
          <Link href="/" className="text-sm font-medium" style={{ color: 'var(--brand-600)' }}>
            Voltar ao início
          </Link>
        </div>
      </main>
    );
  }

  // ── formulário multi-step ──────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--surface-alt)' }}>
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm p-8">

        {/* indicador de passos */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className="flex-shrink-0 flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: i <= step ? 'var(--brand-600)' : 'var(--surface-alt)',
                    color: i <= step ? '#fff' : 'var(--ink-400)',
                    border: `2px solid ${i <= step ? 'var(--brand-600)' : 'var(--line)'}`,
                  }}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs mt-1 hidden sm:block" style={{ color: i === step ? 'var(--brand-600)' : 'var(--ink-400)' }}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-px" style={{ background: i < step ? 'var(--brand-600)' : 'var(--line)' }} />
              )}
            </div>
          ))}
        </div>

        {serverError && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm mb-4" style={{ background: 'var(--brand-50)', color: 'var(--brand-700)', border: '1px solid var(--brand-200)' }}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {serverError}
          </div>
        )}

        {/* step 0 — Dados do aluno */}
        {step === 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-900)' }}>Dados do aluno</h2>
            <Field label="Nome completo *" error={errors.nome}>
              <Input value={aluno.nome} onChange={set(setAluno)('nome')} placeholder="Nome do aluno" />
            </Field>
            <Field label="CPF *" error={errors.cpf}>
              <Input value={aluno.cpf} onChange={set(setAluno)('cpf')} placeholder="000.000.000-00" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="E-mail">
                <Input type="email" value={aluno.email} onChange={set(setAluno)('email')} placeholder="email@exemplo.com" />
              </Field>
              <Field label="Telefone">
                <Input value={aluno.telefone} onChange={set(setAluno)('telefone')} placeholder="(11) 99999-9999" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Sexo">
                <Select value={aluno.sexo} onChange={set(setAluno as any)('sexo')}>
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                </Select>
              </Field>
              <Field label="Data de nascimento">
                <Input type="date" value={aluno.dataNascimento} onChange={set(setAluno)('dataNascimento')} />
              </Field>
            </div>
          </div>
        )}

        {/* step 1 — Responsável */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-900)' }}>Responsável financeiro</h2>
            <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl" style={{ border: '1px solid var(--line)', background: temResponsavel ? 'var(--brand-50)' : 'var(--surface-alt)' }}>
              <input type="checkbox" checked={temResponsavel} onChange={e => setTemResponsavel(e.target.checked)} className="w-4 h-4 accent-[var(--brand-600)]" />
              <span className="text-sm font-medium" style={{ color: 'var(--ink-900)' }}>
                O responsável financeiro é diferente do aluno
              </span>
            </label>
            {temResponsavel && (
              <>
                <Field label="Nome completo *" error={errors.respNome}>
                  <Input value={resp.nome} onChange={set(setResp as any)('nome')} placeholder="Nome do responsável" />
                </Field>
                <Field label="CPF *" error={errors.respCpf}>
                  <Input value={resp.cpf} onChange={set(setResp as any)('cpf')} placeholder="000.000.000-00" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="E-mail">
                    <Input type="email" value={resp.email} onChange={set(setResp as any)('email')} placeholder="email@exemplo.com" />
                  </Field>
                  <Field label="Telefone">
                    <Input value={resp.telefone} onChange={set(setResp as any)('telefone')} placeholder="(11) 99999-9999" />
                  </Field>
                </div>
                <Field label="Parentesco">
                  <Select value={resp.tipoParentesco} onChange={set(setResp as any)('tipoParentesco')}>
                    <option value="1">Mãe</option>
                    <option value="2">Pai</option>
                    <option value="3">Outro</option>
                  </Select>
                </Field>
              </>
            )}
          </div>
        )}

        {/* step 2 — Curso */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-900)' }}>Dados do curso</h2>
            <Field label="Curso *" error={errors.curso}>
              <Input value={curso.curso} onChange={set(setCurso as any)('curso')} placeholder="Ex: Enfermagem" />
            </Field>
            <Field label="Unidade *" error={errors.unidade}>
              <Input value={curso.unidade} onChange={set(setCurso as any)('unidade')} placeholder="Ex: Unidade Centro" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Turno">
                <Select value={curso.turno} onChange={set(setCurso as any)('turno')}>
                  <option>Manhã</option>
                  <option>Tarde</option>
                  <option>Noite</option>
                  <option>Integral</option>
                </Select>
              </Field>
              <Field label="Período letivo *" error={errors.periodoLetivo}>
                <Input value={curso.periodoLetivo} onChange={set(setCurso as any)('periodoLetivo')} placeholder="Ex: 2025/1" />
              </Field>
            </div>
            <Field label="Currículo (opcional)">
              <Input value={curso.curriculo} onChange={set(setCurso as any)('curriculo')} placeholder="Código do currículo" />
            </Field>
          </div>
        )}

        {/* step 3 — Plano de pagamento */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold" style={{ fontFamily: 'var(--font-sora)', color: 'var(--ink-900)' }}>Plano de pagamento</h2>
            <p className="text-sm" style={{ color: 'var(--ink-500)' }}>
              A 1ª parcela será gerada via Mercado Pago. O financeiro configurará o plano completo no sistema.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº de parcelas">
                <Input type="number" min={1} value={plano.numeroParcelas} onChange={set(setPlano as any)('numeroParcelas')} placeholder="12" />
              </Field>
              <Field label="Valor por parcela (R$) *" error={errors.valorParcela}>
                <Input type="number" min={0} step="0.01" value={plano.valorParcela} onChange={set(setPlano as any)('valorParcela')} placeholder="0,00" />
              </Field>
            </div>
            <Field label="Data da 1ª parcela *" error={errors.dataPrimeiraParcela}>
              <Input type="date" value={plano.dataPrimeiraParcela} onChange={set(setPlano as any)('dataPrimeiraParcela')} />
            </Field>
            <Field label="Desconto (opcional)">
              <Input value={plano.desconto} onChange={set(setPlano as any)('desconto')} placeholder="Ex: 10%" />
            </Field>
          </div>
        )}

        {/* botões de navegação */}
        <div className="flex gap-3 mt-6">
          {step > 0 && (
            <button onClick={back} className="flex-1 btn" style={{ border: '1px solid var(--line)', color: 'var(--ink-700)', background: 'white' }}>
              Voltar
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button onClick={next} className="flex-1 btn btn-primary py-3">
              Próximo
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="flex-1 btn btn-primary py-3">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Registrando...
                </span>
              ) : 'Confirmar matrícula'}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
