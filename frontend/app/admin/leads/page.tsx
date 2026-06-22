'use client';

import { useEffect, useState } from 'react';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type LeadStatus = 'novo' | 'contatado' | 'agendado' | 'inscrito' | 'matriculado' | 'perdido';

interface Lead {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  cursoInteresse: string | null;
  origem: string;
  status: LeadStatus;
  observacao: string | null;
  sophiaAlunoId: number | null;
  criadoEm: string;
}

interface HistoricoItem {
  id: number;
  estagioAnterior: string | null;
  estagioNovo: string;
  observacao: string | null;
  criadoEm: string;
}

interface FunilItem {
  estagio: string;
  total: number;
}

interface Relatorio {
  total: number;
  noMes: number;
  funil: FunilItem[];
  taxaConversao: string;
}

const ESTAGIOS: { value: LeadStatus; label: string; cor: string; bg: string }[] = [
  { value: 'novo',        label: 'Novo',        cor: '#6366f1', bg: '#ede9fe' },
  { value: 'contatado',   label: 'Contatado',   cor: '#0ea5e9', bg: '#e0f2fe' },
  { value: 'agendado',    label: 'Agendado',    cor: '#f59e0b', bg: '#fef3c7' },
  { value: 'inscrito',    label: 'Inscrito',    cor: '#8b5cf6', bg: '#ede9fe' },
  { value: 'matriculado', label: 'Matriculado', cor: '#10b981', bg: '#d1fae5' },
  { value: 'perdido',     label: 'Perdido',     cor: '#6b7280', bg: '#f3f4f6' },
];

function statusConfig(s: string) {
  return ESTAGIOS.find(e => e.value === s) ?? { value: s, label: s, cor: '#6b7280', bg: '#f3f4f6' };
}

function headers(key: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtDateHour(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function LeadsAdminPage() {
  const [apiKey, setApiKey] = useState('');
  const [autenticado, setAutenticado] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroOrigem, setFiltroOrigem] = useState('');
  const [leadSelecionado, setLeadSelecionado] = useState<Lead | null>(null);
  const [historico, setHistorico] = useState<HistoricoItem[]>([]);
  const [movendo, setMovendo] = useState(false);
  const [novoEstagio, setNovoEstagio] = useState<LeadStatus>('contatado');
  const [obsMovimento, setObsMovimento] = useState('');
  const [vista, setVista] = useState<'lista' | 'kanban'>('lista');

  async function entrar(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!apiKey.trim()) { setErro('Informe a API Key.'); return; }
    setErro('');
    setLoading(true);
    try {
      const [leadsRes, relRes] = await Promise.all([
        fetch(`${BASE}/v1/admin/leads`, { headers: headers(apiKey) }),
        fetch(`${BASE}/v1/admin/leads/funil`, { headers: headers(apiKey) }),
      ]);
      if (leadsRes.status === 401) { setErro('API Key inválida.'); return; }
      if (!leadsRes.ok) { setErro('Erro ao carregar leads.'); return; }
      setLeads(await leadsRes.json());
      if (relRes.ok) setRelatorio(await relRes.json());
      setAutenticado(true);
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }

  async function recarregar() {
    const params = new URLSearchParams();
    if (filtroStatus) params.set('status', filtroStatus);
    if (filtroOrigem) params.set('origem', filtroOrigem);
    const [leadsRes, relRes] = await Promise.all([
      fetch(`${BASE}/v1/admin/leads?${params}`, { headers: headers(apiKey) }),
      fetch(`${BASE}/v1/admin/leads/funil`, { headers: headers(apiKey) }),
    ]);
    if (leadsRes.ok) setLeads(await leadsRes.json());
    if (relRes.ok) setRelatorio(await relRes.json());
  }

  useEffect(() => { if (autenticado) recarregar(); }, [filtroStatus, filtroOrigem]);

  async function abrirLead(lead: Lead) {
    setLeadSelecionado(lead);
    setNovoEstagio(lead.status);
    setObsMovimento('');
    const res = await fetch(`${BASE}/v1/admin/leads/${lead.id}/historico`, { headers: headers(apiKey) });
    if (res.ok) setHistorico(await res.json());
    else setHistorico([]);
  }

  async function moverEstagio() {
    if (!leadSelecionado) return;
    setMovendo(true);
    try {
      const res = await fetch(`${BASE}/v1/admin/leads/${leadSelecionado.id}/estagio`, {
        method: 'PATCH',
        headers: headers(apiKey),
        body: JSON.stringify({ estagio: novoEstagio, observacao: obsMovimento || undefined }),
      });
      if (res.ok) {
        const atualizado = await res.json();
        setLeadSelecionado(atualizado);
        await abrirLead(atualizado);
        await recarregar();
      }
    } finally {
      setMovendo(false);
    }
  }

  const leadsFiltrados = leads.filter(l => {
    if (filtroStatus && l.status !== filtroStatus) return false;
    if (filtroOrigem && l.origem !== filtroOrigem) return false;
    return true;
  });

  if (!autenticado) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui)' }}>
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', padding: '2.5rem', width: '100%', maxWidth: '380px', boxShadow: 'var(--shadow-md)' }}>
          <h1 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.25rem', color: 'var(--ink-900)', marginBottom: '0.25rem' }}>CRM de Leads</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--ink-500)', marginBottom: '1.5rem' }}>IPESSP — Gestão de admissões</p>
          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--ink-700)', marginBottom: '0.375rem' }}>API Key</label>
              <input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="Chave de acesso" style={{ width: '100%', border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.625rem 0.875rem', fontSize: '0.9375rem', color: 'var(--ink-900)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            {erro && <p style={{ fontSize: '0.8125rem', color: 'var(--brand-600)' }}>{erro}</p>}
            <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3">{loading ? 'Entrando...' : 'Entrar'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-alt)', fontFamily: 'var(--font-inter, system-ui)' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--line)', padding: '0 1.5rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)', gap: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1rem', color: 'var(--brand-600)' }}>IPESSP — CRM Leads</span>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a href="/admin" style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', textDecoration: 'none' }}>← Admin</a>
          <button onClick={() => { setAutenticado(false); setApiKey(''); setLeads([]); }} style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', background: 'none', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.375rem 0.75rem', cursor: 'pointer' }}>Sair</button>
        </div>
      </header>

      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Métricas de funil */}
        {relatorio && (
          <section>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <MetricCard label="Total de leads" valor={relatorio.total} />
              <MetricCard label="Este mês" valor={relatorio.noMes} />
              <MetricCard label="Taxa de conversão" valor={relatorio.taxaConversao} />
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '1.25rem 1.5rem' }}>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '0.875rem', color: 'var(--ink-700)', margin: '0 0 0.875rem' }}>Funil de Conversão</h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                {relatorio.funil.map(f => {
                  const cfg = statusConfig(f.estagio);
                  const max = Math.max(...relatorio.funil.map(x => x.total), 1);
                  const pct = Math.round((f.total / max) * 100);
                  return (
                    <div key={f.estagio} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.375rem', flex: '1', minWidth: '70px' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem', color: cfg.cor }}>{f.total}</span>
                      <div style={{ width: '100%', background: '#f1f1f1', borderRadius: '4px', height: '8px' }}>
                        <div style={{ width: `${pct}%`, background: cfg.cor, borderRadius: '4px', height: '8px' }} />
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--ink-500)', textAlign: 'center' }}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Filtros + troca de vista */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} style={selectStyle}>
            <option value="">Todos os estágios</option>
            {ESTAGIOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
          </select>
          <select value={filtroOrigem} onChange={e => setFiltroOrigem(e.target.value)} style={selectStyle}>
            <option value="">Todas as origens</option>
            {['site','chatbot','whatsapp','n8n','manual'].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <span style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button onClick={() => setVista('lista')} style={{ ...btnToggle, ...(vista === 'lista' ? btnToggleAtivo : {}) }}>Lista</button>
            <button onClick={() => setVista('kanban')} style={{ ...btnToggle, ...(vista === 'kanban' ? btnToggleAtivo : {}) }}>Kanban</button>
          </div>
        </div>

        {/* Conteúdo */}
        {vista === 'lista' ? (
          <ListaLeads leads={leadsFiltrados} onAbrir={abrirLead} />
        ) : (
          <KanbanLeads leads={leadsFiltrados} onAbrir={abrirLead} />
        )}
      </main>

      {/* Drawer de detalhe */}
      {leadSelecionado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.35)', zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setLeadSelecionado(null)}>
          <div style={{ width: '100%', maxWidth: '440px', background: 'var(--surface)', height: '100%', overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'var(--font-sora)', fontWeight: 700, fontSize: '1.0625rem', color: 'var(--ink-900)', margin: 0 }}>{leadSelecionado.nome}</h2>
              <button onClick={() => setLeadSelecionado(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--ink-400)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {leadSelecionado.email && <InfoRow label="Email" val={leadSelecionado.email} />}
              {leadSelecionado.telefone && <InfoRow label="Telefone" val={leadSelecionado.telefone} />}
              {leadSelecionado.cursoInteresse && <InfoRow label="Curso" val={leadSelecionado.cursoInteresse} />}
              <InfoRow label="Origem" val={leadSelecionado.origem} />
              <InfoRow label="Criado em" val={fmtDate(leadSelecionado.criadoEm)} />
              {leadSelecionado.sophiaAlunoId && <InfoRow label="Aluno SophiA" val={`#${leadSelecionado.sophiaAlunoId}`} />}
              {leadSelecionado.observacao && <InfoRow label="Obs." val={leadSelecionado.observacao} />}
            </div>

            {/* Mover estágio */}
            <div style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', margin: 0 }}>Mover estágio</h3>
              <StatusBadge status={leadSelecionado.status} />
              <select value={novoEstagio} onChange={e => setNovoEstagio(e.target.value as LeadStatus)} style={selectStyle}>
                {ESTAGIOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
              </select>
              <input placeholder="Observação (opcional)" value={obsMovimento} onChange={e => setObsMovimento(e.target.value)} style={{ border: '1.5px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', fontSize: '0.875rem', outline: 'none', color: 'var(--ink-900)' }} />
              <button
                disabled={movendo || novoEstagio === leadSelecionado.status}
                onClick={moverEstagio}
                style={{ background: 'var(--brand-600)', color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)', padding: '0.6rem 1rem', fontWeight: 700, fontSize: '0.875rem', cursor: movendo || novoEstagio === leadSelecionado.status ? 'not-allowed' : 'pointer', opacity: movendo || novoEstagio === leadSelecionado.status ? 0.55 : 1 }}
              >
                {movendo ? 'Movendo...' : 'Confirmar'}
              </button>
            </div>

            {/* Histórico */}
            <div>
              <h3 style={{ fontFamily: 'var(--font-sora)', fontWeight: 600, fontSize: '0.8125rem', color: 'var(--ink-700)', marginBottom: '0.75rem' }}>Histórico</h3>
              {historico.length === 0 ? (
                <p style={{ fontSize: '0.8125rem', color: 'var(--ink-400)' }}>Sem registros de movimentação.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {historico.map(h => (
                    <div key={h.id} style={{ background: 'var(--surface-alt)', borderRadius: 'var(--radius-sm)', padding: '0.625rem 0.875rem', fontSize: '0.8125rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap' }}>
                        {h.estagioAnterior && <StatusBadge status={h.estagioAnterior} small />}
                        {h.estagioAnterior && <span style={{ color: 'var(--ink-400)' }}>→</span>}
                        <StatusBadge status={h.estagioNovo} small />
                        <span style={{ marginLeft: 'auto', color: 'var(--ink-400)', fontSize: '0.75rem' }}>{fmtDateHour(h.criadoEm)}</span>
                      </div>
                      {h.observacao && <p style={{ margin: '0.375rem 0 0', color: 'var(--ink-600)', fontSize: '0.775rem' }}>{h.observacao}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListaLeads({ leads, onAbrir }: { leads: Lead[]; onAbrir(l: Lead): void }) {
  if (leads.length === 0) {
    return <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '2.5rem', textAlign: 'center', color: 'var(--ink-500)', fontSize: '0.875rem' }}>Nenhum lead encontrado.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {leads.map(l => (
        <div key={l.id} onClick={() => onAbrir(l)} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', transition: 'box-shadow .15s' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--ink-900)' }}>{l.nome}</span>
              <StatusBadge status={l.status} small />
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--ink-500)', margin: 0 }}>
              {l.email ?? l.telefone ?? '—'} · {l.cursoInteresse ?? 'sem curso'} · {l.origem}
            </p>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--ink-400)', flexShrink: 0 }}>{new Date(l.criadoEm).toLocaleDateString('pt-BR')}</span>
        </div>
      ))}
    </div>
  );
}

function KanbanLeads({ leads, onAbrir }: { leads: Lead[]; onAbrir(l: Lead): void }) {
  return (
    <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1rem' }}>
      {ESTAGIOS.map(e => {
        const colLeads = leads.filter(l => l.status === e.value);
        return (
          <div key={e.value} style={{ minWidth: '220px', maxWidth: '240px', flex: '0 0 220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.375rem 0.625rem', background: e.bg, borderRadius: 'var(--radius-sm)' }}>
              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: e.cor }}>{e.label}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 700, fontSize: '0.75rem', color: e.cor }}>{colLeads.length}</span>
            </div>
            {colLeads.map(l => (
              <div key={l.id} onClick={() => onAbrir(l)} style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-sm)', padding: '0.75rem', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontSize: '0.8125rem' }}>
                <p style={{ fontWeight: 600, margin: '0 0 0.25rem', color: 'var(--ink-900)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.nome}</p>
                <p style={{ margin: 0, color: 'var(--ink-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.cursoInteresse ?? l.email ?? '—'}</p>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const cfg = statusConfig(status);
  return (
    <span style={{ display: 'inline-block', padding: small ? '0.1rem 0.45rem' : '0.2rem 0.6rem', borderRadius: '999px', background: cfg.bg, color: cfg.cor, fontWeight: 700, fontSize: small ? '0.7rem' : '0.75rem' }}>{cfg.label}</span>
  );
}

function InfoRow({ label, val }: { label: string; val: string }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8125rem' }}>
      <span style={{ color: 'var(--ink-400)', minWidth: '90px', flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--ink-900)', wordBreak: 'break-word' }}>{val}</span>
    </div>
  );
}

function MetricCard({ label, valor }: { label: string; valor: string | number }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--radius-md)', padding: '1rem 1.25rem', flex: '1', minWidth: '130px', boxShadow: 'var(--shadow-sm)' }}>
      <p style={{ fontSize: '0.75rem', color: 'var(--ink-500)', margin: '0 0 0.25rem' }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: '1.375rem', color: 'var(--ink-900)', margin: 0 }}>{valor}</p>
    </div>
  );
}

const selectStyle: React.CSSProperties = {
  border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  padding: '0.5rem 0.75rem',
  fontSize: '0.875rem',
  color: 'var(--ink-900)',
  background: 'var(--surface)',
  outline: 'none',
};

const btnToggle: React.CSSProperties = {
  fontSize: '0.8125rem',
  fontWeight: 600,
  padding: '0.375rem 0.75rem',
  border: '1.5px solid var(--line)',
  borderRadius: 'var(--radius-sm)',
  cursor: 'pointer',
  background: 'var(--surface)',
  color: 'var(--ink-500)',
};

const btnToggleAtivo: React.CSSProperties = {
  background: 'var(--brand-600)',
  color: '#fff',
  borderColor: 'var(--brand-600)',
};
