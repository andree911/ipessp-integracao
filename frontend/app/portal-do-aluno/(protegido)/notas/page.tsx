'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Matricula {
  codigo: number;
  curso: string | null;
}

interface NotasResposta {
  nomePeriodo?: string;
  inicioPeriodo?: string;
  terminoPeriodo?: string;
  periodoAtual?: boolean;
  nomeAluno: string;
  nomeCurso?: string;
  nomeTurma?: string;
  etapas: unknown[];
}

function formatarData(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('pt-BR');
}

// Formato interno de cada item de "etapas" ainda não confirmado com dados
// reais (a Sophia só devolveu array vazio até agora) — renderiza de forma
// genérica pra não quebrar quando vier preenchido.
function EtapaGenerica({ item }: { item: unknown }) {
  if (typeof item !== 'object' || item === null) {
    return <p className="text-sm" style={{ color: 'var(--ink-900)' }}>{String(item)}</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
      {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
        <div key={k} className="contents">
          <span style={{ color: 'var(--ink-500)' }}>{k}</span>
          <span style={{ color: 'var(--ink-900)' }}>{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
        </div>
      ))}
    </div>
  );
}

export default function NotasPage() {
  const router = useRouter();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState<number | null>(null);
  const [dados, setDados] = useState<NotasResposta | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/portal/curso')
      .then(async (res) => {
        if (res.status === 401) { router.push('/portal-do-aluno/login'); return; }
        const data: Matricula[] = await res.json();
        if (!res.ok) { setErro('Não foi possível carregar suas matrículas.'); return; }
        setMatriculas(data);
        if (data.length > 0) setMatriculaSelecionada(data[0].codigo);
        else setCarregando(false);
      })
      .catch(() => { setErro('Não foi possível conectar. Tente novamente.'); setCarregando(false); });
  }, [router]);

  useEffect(() => {
    if (matriculaSelecionada === null) return;
    setCarregando(true);
    fetch(`/api/portal/notas?matricula=${matriculaSelecionada}`)
      .then(async (res) => {
        if (res.status === 401) { router.push('/portal-do-aluno/login'); return; }
        const data = await res.json();
        if (!res.ok) { setErro((data as { message?: string }).message ?? 'Não foi possível carregar suas notas.'); return; }
        setDados(data);
      })
      .catch(() => setErro('Não foi possível conectar. Tente novamente.'))
      .finally(() => setCarregando(false));
  }, [matriculaSelecionada, router]);

  if (erro) return <p style={{ color: 'var(--brand-600)' }}>{erro}</p>;

  return (
    <div className="flex flex-col gap-4">
      {matriculas.length > 1 && (
        <select
          value={matriculaSelecionada ?? ''}
          onChange={(e) => setMatriculaSelecionada(Number(e.target.value))}
          className="w-fit px-3 py-2 rounded-lg border text-sm"
          style={{ borderColor: 'var(--line)' }}
        >
          {matriculas.map((m) => (
            <option key={m.codigo} value={m.codigo}>{m.curso ?? `Matrícula ${m.codigo}`}</option>
          ))}
        </select>
      )}

      {carregando && <p style={{ color: 'var(--ink-700)' }}>Carregando...</p>}

      {!carregando && matriculas.length === 0 && (
        <p style={{ color: 'var(--ink-700)' }}>Nenhuma matrícula encontrada.</p>
      )}

      {!carregando && dados && (
        <>
          <div className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--surface-alt)' }}>
            <p className="font-medium" style={{ color: 'var(--ink-900)' }}>{dados.nomeCurso ?? 'Curso não informado'}</p>
            <div className="text-xs mt-1 flex flex-wrap gap-x-4 gap-y-1" style={{ color: 'var(--ink-700)' }}>
              {dados.nomeTurma && <span>Turma: {dados.nomeTurma}</span>}
              {dados.nomePeriodo && <span>Período: {dados.nomePeriodo}</span>}
              {formatarData(dados.inicioPeriodo) && formatarData(dados.terminoPeriodo) && (
                <span>{formatarData(dados.inicioPeriodo)} – {formatarData(dados.terminoPeriodo)}</span>
              )}
              {dados.periodoAtual && (
                <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}>
                  Período atual
                </span>
              )}
            </div>
          </div>

          {dados.etapas.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--ink-700)' }}>Nenhuma nota lançada ainda neste período.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dados.etapas.map((etapa, i) => (
                <div key={i} className="p-3 rounded-lg border" style={{ borderColor: 'var(--line)' }}>
                  <EtapaGenerica item={etapa} />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
