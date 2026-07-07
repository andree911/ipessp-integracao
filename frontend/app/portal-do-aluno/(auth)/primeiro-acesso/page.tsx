'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import WhatsAppFloat from '@/app/components/WhatsAppFloat';
import { Field, Input, maskCPF, validarCPF } from '@/app/portal-do-aluno/_lib/form';

export default function PrimeiroAcessoPage() {
  const router = useRouter();
  const [ra, setRa] = useState('');
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  function validar(): boolean {
    const errs: Record<string, string> = {};
    if (!ra.trim()) errs.ra = 'Informe seu RA.';
    if (!validarCPF(cpf)) errs.cpf = 'CPF inválido.';
    if (senha.length < 6) errs.senha = 'A senha deve ter no mínimo 6 caracteres.';
    if (confirmarSenha !== senha) errs.confirmarSenha = 'As senhas não conferem.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro('');
    if (!validar()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/portal/auth/primeiro-acesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ra, cpf: cpf.replace(/\D/g, ''), senha }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErro(data.message ?? 'Não foi possível criar sua conta. Confira o RA e o CPF informados.');
        return;
      }
      router.push('/portal-do-aluno');
      router.refresh();
    } catch {
      setErro('Não foi possível conectar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--ink-900)' }}>Primeiro acesso</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--ink-700)' }}>
          Confirme seu RA e CPF pra criar a senha do Portal do Aluno.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="RA" error={errors.ra}>
            <Input value={ra} onChange={e => setRa(e.target.value)} required autoFocus />
          </Field>
          <Field label="CPF" error={errors.cpf}>
            <Input value={cpf} onChange={e => setCpf(maskCPF(e.target.value))} required inputMode="numeric" />
          </Field>
          <Field label="Senha (mínimo 6 caracteres)" error={errors.senha}>
            <Input type="password" value={senha} onChange={e => setSenha(e.target.value)} required />
          </Field>
          <Field label="Confirmar senha" error={errors.confirmarSenha}>
            <Input type="password" value={confirmarSenha} onChange={e => setConfirmarSenha(e.target.value)} required />
          </Field>

          {erro && <p className="text-sm" style={{ color: 'var(--brand-600)' }}>{erro}</p>}

          <button type="submit" disabled={loading} className="btn btn-primary justify-center mt-2">
            {loading ? 'Criando conta...' : 'Criar senha e entrar'}
          </button>
        </form>

        <div className="mt-6 text-sm text-center">
          <Link href="/portal-do-aluno/login" className="hover:underline" style={{ color: 'var(--brand-600)' }}>
            Já tenho senha — fazer login
          </Link>
        </div>
      </main>
      <Footer />
      <WhatsAppFloat />
    </>
  );
}
