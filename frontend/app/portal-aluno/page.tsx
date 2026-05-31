'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getSession, clearSession } from '../lib/api';

interface Academico {
  id: string;
  curso: string;
  turma: string;
  situacao: string;
  nome: string;
  email: string;
  telefone: string;
}

interface Lancamento {
  id: string;
  descricao: string;
  valor: string;
  vencimento: string;
  situacao: 'aberto' | 'recebido' | 'baixado';
  codigo_boleto: string | null;
}

const SITUACAO_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  aberto:   { label: 'Em aberto',  color: '#b81f1f', bg: '#fdf2f2' },
  recebido: { label: 'Pago',       color: '#1f9d55', bg: '#f0fdf4' },
  baixado:  { label: 'Baixado',    color: '#6b6060', bg: '#faf7f7' },
};

function formatBRL(valor: string | number) {
  return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(iso: string) {
  const [y, m, d] = iso.split('-');
  if (y && m && d) return `${d}/${m}/${y}`;
  return iso;
}

async function downloadBoleto(codigo: string) {
  const res = await apiFetch(`/v1/me/boleto/${codigo}`);
  if (!res.ok) { alert('Boleto não disponível no momento.'); return; }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export default function PortalAlunoPage() {
  const router = useRouter();
  const session = typeof window !== 'undefined' ? getSession() : null;

  const [academico, setAcademico] = useState<Academico | null>(null);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [semVinculo, setSemVinculo] = useState(false);
  const [boletosCarregando, setBoletosCarregando] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!session || session.tipo !== 'aluno') {
      router.replace('/login-aluno');
      return;
    }

    async function load() {
      const [resAc, resLanc] = await Promise.all([
        apiFetch('/v1/me/academico'),
        apiFetch('/v1/me/financeiro'),
      ]);

      if (resAc.status === 404) {
        setSemVinculo(true);
        setLoading(false);
        return;
      }

      if (resAc.ok) setAcademico(await resAc.json());
      if (resLanc.ok) setLancamentos(await resLanc.json());
      setLoading(false);
    }

    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function logout() {
    clearSession();
    router.push('/login-aluno');
  }

  const abertos   = lancamentos.filter(l => l.situacao === 'aberto');
  const restantes = lancamentos.filter(l => l.situacao !== 'aberto');
  const totalAberto = abertos.reduce((s, l) => s + Number(l.valor), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui)' }}>
      {/* Header */}
      <header
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--line)',
          padding: '0 1.5rem',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.125rem', color: 'var(--brand-600)' }}>
            IPESSP
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginTop: '2px' }}>Portal do Aluno</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--ink-700)', fontWeight: 500 }}>
            {session?.nome}
          </span>
          <button
            onClick={logout}
            style={{
              fontSize: '0.8125rem',
              color: 'var(--ink-500)',
              background: 'none',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.375rem 0.75rem',
              cursor: 'pointer',
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
            <svg className="animate-spin" width="32" height="32" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="var(--brand-300)" strokeWidth="4"/>
              <path fill="var(--brand-600)" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
          </div>
        ) : semVinculo ? (
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--line)',
              padding: '2.5rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            <svg width="48" height="48" fill="none" stroke="var(--ink-300)" strokeWidth="1.5" viewBox="0 0 24 24" style={{ margin: '0 auto 1rem' }}>
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
            <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--ink-900)', marginBottom: '0.5rem' }}>
              Dados acadêmicos não encontrados
            </h2>
            <p style={{ color: 'var(--ink-500)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Seu e-mail de cadastro não está vinculado a nenhum aluno no sistema. Entre em contato com a secretaria.
            </p>
            <a
              href="tel:+551197692-2127"
              className="btn btn-primary"
              style={{ display: 'inline-flex' }}
            >
              Contatar secretaria
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Card acadêmico */}
            {academico && (
              <section
                style={{
                  background: 'var(--surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--line)',
                  padding: '1.5rem',
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <h2
                  style={{
                    fontFamily: 'var(--font-sora)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--ink-900)',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <svg width="18" height="18" fill="none" stroke="var(--brand-600)" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
                  </svg>
                  Dados Acadêmicos
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {[
                    { label: 'Curso', value: academico.curso || '—' },
                    { label: 'Turma', value: academico.turma || '—' },
                    { label: 'Situação', value: academico.situacao || '—' },
                    { label: 'Telefone', value: academico.telefone || '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--ink-500)', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                      <p style={{ fontSize: '0.9375rem', color: 'var(--ink-900)', fontWeight: 500 }}>{value}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Resumo financeiro */}
            {abertos.length > 0 && (
              <div
                style={{
                  background: 'var(--brand-50)',
                  border: '1px solid var(--brand-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--brand-700)', marginBottom: '0.25rem' }}>
                    {abertos.length} parcela{abertos.length > 1 ? 's' : ''} em aberto
                  </p>
                  <p style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.5rem', color: 'var(--brand-700)' }}>
                    {formatBRL(totalAberto)}
                  </p>
                </div>
                <svg width="32" height="32" fill="none" stroke="var(--brand-400)" strokeWidth="1.5" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              </div>
            )}

            {/* Tabela financeira */}
            <section
              style={{
                background: 'var(--surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--line)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" fill="none" stroke="var(--brand-600)" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                  <line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: 'var(--ink-900)' }}>
                  Financeiro
                </h2>
              </div>

              {lancamentos.length === 0 ? (
                <p style={{ padding: '2rem 1.5rem', color: 'var(--ink-500)', fontSize: '0.875rem', textAlign: 'center' }}>
                  Nenhum lançamento encontrado.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-alt)' }}>
                        {['Descrição', 'Vencimento', 'Valor', 'Situação', ''].map(h => (
                          <th
                            key={h}
                            style={{
                              padding: '0.75rem 1rem',
                              textAlign: 'left',
                              fontWeight: 600,
                              color: 'var(--ink-700)',
                              fontSize: '0.75rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              borderBottom: '1px solid var(--line)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...abertos, ...restantes].map((l, i) => {
                        const st = SITUACAO_LABEL[l.situacao] ?? SITUACAO_LABEL.baixado;
                        return (
                          <tr
                            key={l.id}
                            style={{ borderBottom: i < lancamentos.length - 1 ? '1px solid var(--line)' : 'none' }}
                          >
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--ink-900)' }}>{l.descricao}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--ink-700)', whiteSpace: 'nowrap' }}>{formatDate(l.vencimento)}</td>
                            <td style={{ padding: '0.875rem 1rem', color: 'var(--ink-900)', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatBRL(l.valor)}</td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.625rem',
                                  borderRadius: 'var(--radius-pill)',
                                  background: st.bg,
                                  color: st.color,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {st.label}
                              </span>
                            </td>
                            <td style={{ padding: '0.875rem 1rem' }}>
                              {l.situacao === 'aberto' && l.codigo_boleto && (
                                <button
                                  disabled={boletosCarregando[l.codigo_boleto]}
                                  onClick={async () => {
                                    setBoletosCarregando(p => ({ ...p, [l.codigo_boleto!]: true }));
                                    await downloadBoleto(l.codigo_boleto!);
                                    setBoletosCarregando(p => ({ ...p, [l.codigo_boleto!]: false }));
                                  }}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    color: 'var(--brand-600)',
                                    background: 'none',
                                    border: '1px solid var(--brand-200)',
                                    borderRadius: 'var(--radius-sm)',
                                    padding: '0.3rem 0.75rem',
                                    cursor: boletosCarregando[l.codigo_boleto] ? 'wait' : 'pointer',
                                    whiteSpace: 'nowrap',
                                    opacity: boletosCarregando[l.codigo_boleto] ? 0.6 : 1,
                                  }}
                                >
                                  {boletosCarregando[l.codigo_boleto] ? (
                                    <svg className="animate-spin" width="13" height="13" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                                    </svg>
                                  ) : (
                                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/>
                                      <line x1="12" y1="15" x2="12" y2="3"/>
                                    </svg>
                                  )}
                                  Boleto
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
