'use client';

import { useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Professor {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  criado_em: string;
  matricula: string | null;
  telefone: string | null;
  validado: boolean;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function apiHeaders(apiKey: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` };
}

export default function AdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [acoes, setAcoes] = useState<Record<string, boolean>>({});

  async function entrar(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!apiKey.trim()) { setErro('Informe a API Key.'); return; }
    setErro('');
    setLoading(true);
    try {
      const res = await fetch(`${BASE}/v1/admin/professores`, { headers: apiHeaders(apiKey) });
      if (res.status === 401) { setErro('API Key inválida.'); return; }
      if (!res.ok) { setErro('Erro ao carregar.'); return; }
      setProfessores(await res.json());
      setAutenticado(true);
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function recarregar() {
    const res = await fetch(`${BASE}/v1/admin/professores`, { headers: apiHeaders(apiKey) });
    if (res.ok) setProfessores(await res.json());
  }

  async function acao(id: string, tipo: 'aprovar' | 'rejeitar') {
    setAcoes(a => ({ ...a, [id]: true }));
    try {
      const res = await fetch(`${BASE}/v1/admin/professores/${id}/${tipo}`, {
        method: 'PATCH',
        headers: apiHeaders(apiKey),
      });
      if (res.ok) await recarregar();
    } finally {
      setAcoes(a => ({ ...a, [id]: false }));
    }
  }

  const pendentes  = professores.filter(p => !p.ativo);
  const aprovados  = professores.filter(p => p.ativo);

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui)' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '2.5rem', width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-md)' }}>
          <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--ink-900)', marginBottom: '0.25rem' }}>
            Painel Admin
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginBottom: '1.5rem' }}>
            IPESSP — Gestão de professores
          </p>

          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.375rem' }}>
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Chave de acesso"
                style={{
                  width: '100%',
                  border: '1.5px solid var(--line)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.625rem 0.875rem',
                  fontSize: '0.9375rem',
                  color: 'var(--ink-900)',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {erro && <p style={{ fontSize: '0.8125rem', color: 'var(--brand-600)' }}>{erro}</p>}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full justify-center py-3"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui)' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
        <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: 'var(--brand-600)' }}>
          IPESSP — Painel Admin
        </span>
        <button
          onClick={() => { setAutenticado(false); setApiKey(''); setProfessores([]); }}
          style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', background: 'none', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.375rem 0.75rem', cursor: 'pointer' }}
        >
          Sair
        </button>
      </header>

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '2rem 1.5rem' }}>

        {/* Pendentes */}
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink-900)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Pendentes de aprovação
            {pendentes.length > 0 && (
              <span style={{ background: 'var(--brand-600)', color: '#fff', borderRadius: 'var(--radius-pill)', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
                {pendentes.length}
              </span>
            )}
          </h2>

          {pendentes.length === 0 ? (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.875rem' }}>
              Nenhum professor aguardando aprovação.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendentes.map(p => (
                <ProfessorCard key={p.id} prof={p} carregando={!!acoes[p.id]} onAprovar={() => acao(p.id, 'aprovar')} onRejeitar={() => acao(p.id, 'rejeitar')} />
              ))}
            </div>
          )}
        </section>

        {/* Aprovados */}
        {aprovados.length > 0 && (
          <section>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink-900)', marginBottom: '1rem' }}>
              Aprovados ({aprovados.length})
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {aprovados.map(p => (
                <ProfessorCard key={p.id} prof={p} carregando={!!acoes[p.id]} onAprovar={() => acao(p.id, 'aprovar')} onRejeitar={() => acao(p.id, 'rejeitar')} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function ProfessorCard({ prof, carregando, onAprovar, onRejeitar }: {
  prof: Professor;
  carregando: boolean;
  onAprovar: () => void;
  onRejeitar: () => void;
}) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink-900)' }}>{prof.nome}</span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            padding: '0.15rem 0.5rem',
            borderRadius: 'var(--radius-pill)',
            background: prof.ativo ? '#f0fdf4' : 'var(--brand-50)',
            color: prof.ativo ? '#1f9d55' : 'var(--brand-700)',
          }}>
            {prof.ativo ? 'Aprovado' : 'Pendente'}
          </span>
        </div>
        <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', marginBottom: '0.125rem' }}>{prof.email}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--ink-300)' }}>
          Matricula: {prof.matricula ?? '—'} · Solicitado em: {formatDate(prof.criado_em)}
        </p>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
        {!prof.ativo && (
          <button
            disabled={carregando}
            onClick={onAprovar}
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#1f9d55', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.875rem', cursor: carregando ? 'wait' : 'pointer', opacity: carregando ? 0.6 : 1 }}
          >
            {carregando ? '...' : 'Aprovar'}
          </button>
        )}
        {prof.ativo && (
          <button
            disabled={carregando}
            onClick={onRejeitar}
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--brand-700)', background: 'var(--brand-50)', border: '1px solid var(--brand-200)', borderRadius: 'var(--radius-sm)', padding: '0.4rem 0.875rem', cursor: carregando ? 'wait' : 'pointer', opacity: carregando ? 0.6 : 1 }}
          >
            {carregando ? '...' : 'Revogar'}
          </button>
        )}
      </div>
    </div>
  );
}
