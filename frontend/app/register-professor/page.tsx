'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';

export default function RegisterProfessorPage() {
  const [form, setForm] = useState({ name: '', email: '', matricula: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string) => (e: { target: { value: string } }) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Nome é obrigatório.';
    if (!form.email.includes('@')) e.email = 'E-mail inválido.';
    if (!form.matricula.trim()) e.matricula = 'Matrícula institucional obrigatória.';
    if (form.password.length < 8) e.password = 'Mínimo 8 caracteres.';
    if (form.password !== form.confirm) e.confirm = 'As senhas não coincidem.';
    return e;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
  };

  return (
    <AuthLayout
      role="professor"
      panelTitle="Bem-vindo ao time de docentes do IPESSP."
      panelSubtitle="Gerencie suas turmas, lance notas, compartilhe materiais e acompanhe o desempenho dos seus alunos."
    >
      {done ? (
        <div className="text-center py-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'var(--brand-50)' }}
          >
            <svg width="32" height="32" fill="none" stroke="var(--brand-600)" strokeWidth="2.5" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2
            className="font-bold mb-2"
            style={{ fontFamily: 'var(--font-sora)', fontSize: '1.375rem', color: 'var(--ink-900)' }}
          >
            Solicitação enviada!
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--ink-500)' }}>
            Sua conta de professor será validada pela equipe IPESSP em até 24h. Você receberá um e-mail de confirmação.
          </p>
          <Link href="/login-professor" className="btn btn-primary">
            Ir para o Login
          </Link>
        </div>
      ) : (
        <div>
          <h1
            className="font-bold mb-1"
            style={{ fontFamily: 'var(--font-sora, system-ui)', fontSize: 'clamp(1.5rem, 3vw, 1.875rem)', color: 'var(--ink-900)' }}
          >
            Criar conta de professor
          </h1>
          <p className="text-sm mb-7" style={{ color: 'var(--ink-500)' }}>
            Preencha seus dados institucionais. O acesso será validado pela equipe.
          </p>

          {/* Seletor de papel */}
          <div
            className="flex rounded-xl p-1 mb-7"
            style={{ background: 'var(--surface-alt)', border: '1px solid var(--line)' }}
          >
            <Link
              href="/register-aluno"
              className="flex-1 text-center py-2 rounded-lg text-sm font-medium"
              style={{ color: 'var(--ink-500)' }}
            >
              Aluno
            </Link>
            <span
              className="flex-1 text-center py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--brand-600)', color: '#fff' }}
            >
              Professor
            </span>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <AuthInput
                label="Nome completo"
                id="name"
                type="text"
                required
                value={form.name}
                onChange={set('name')}
                placeholder="Seu nome completo"
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{errors.name}</p>}
            </div>

            <div>
              <AuthInput
                label="E-mail institucional"
                id="email"
                type="email"
                required
                value={form.email}
                onChange={set('email')}
                placeholder="professor@ipessp.edu.br"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{errors.email}</p>}
            </div>

            <div>
              <AuthInput
                label="Matrícula institucional"
                id="matricula"
                type="text"
                required
                value={form.matricula}
                onChange={set('matricula')}
                placeholder="Nº de matrícula fornecido pelo IPESSP"
              />
              {errors.matricula && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{errors.matricula}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <AuthInput
                  label="Senha"
                  id="password"
                  showToggle
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="Mín. 8 caracteres"
                  autoComplete="new-password"
                />
                {errors.password && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{errors.password}</p>}
              </div>
              <div>
                <AuthInput
                  label="Confirmar senha"
                  id="confirm"
                  showToggle
                  required
                  value={form.confirm}
                  onChange={set('confirm')}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                {errors.confirm && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{errors.confirm}</p>}
              </div>
            </div>

            <p className="text-xs rounded-xl px-4 py-3" style={{ background: 'var(--surface-alt)', color: 'var(--ink-500)', border: '1px solid var(--line)' }}>
              A conta de professor requer validação institucional. Após o envio, a equipe IPESSP verificará seus dados em até 24 horas.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3.5"
            >
              {loading ? (
                <>
                  <svg className="animate-spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Enviando solicitação...
                </>
              ) : 'Solicitar acesso de professor'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--ink-500)' }}>
            Já tem uma conta?{' '}
            <Link href="/login-professor" className="font-semibold" style={{ color: 'var(--brand-600)' }}>
              Fazer login
            </Link>
          </p>
        </div>
      )}
    </AuthLayout>
  );
}
