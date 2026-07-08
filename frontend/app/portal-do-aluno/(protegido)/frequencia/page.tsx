'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Matricula {
  codigo: number;
  curso: string | null;
}

interface FrequenciaBase {
  aulasDadas: number;
  faltas: number;
  percentualPresenca: number;
}

interface FrequenciaDisciplina {
  codigoDisciplina: number;
  nomeDisciplina: string;
  frequencia: FrequenciaBase;
}

interface FrequenciaCompleta {
  nomeAluno?: string;
  turma?: string;
  frequencia: FrequenciaBase;
  disciplinas: FrequenciaDisciplina[];
}

export default function FrequenciaPage() {
  const router = useRouter();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState<number | null>(null);
  const [dados, setDados] = useState<FrequenciaCompleta | null>(null);
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
    fetch(`/api/portal/frequencia?matricula=${matriculaSelecionada}`)
      .then(async (res) => {
        if (res.status === 401) { router.push('/portal-do-aluno/login'); return; }
        const data = await res.json();
        if (!res.ok) { setErro(data.message ?? 'Não foi possível carregar sua frequência.'); return; }
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
            <p className="text-sm" style={{ color: 'var(--ink-700)' }}>Frequência geral</p>
            <p className="text-2xl font-semibold" style={{ color: 'var(--ink-900)' }}>
              {dados.frequencia.percentualPresenca.toFixed(1)}%
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--ink-500)' }}>
              {dados.frequencia.aulasDadas - dados.frequencia.faltas} de {dados.frequencia.aulasDadas} aulas · {dados.frequencia.faltas} faltas
            </p>
          </div>

          {dados.disciplinas?.length > 0 && (
            <div className="flex flex-col gap-2">
              {dados.disciplinas.map((d) => (
                <div key={d.codigoDisciplina} className="p-3 rounded-lg border flex items-center justify-between" style={{ borderColor: 'var(--line)' }}>
                  <span className="text-sm" style={{ color: 'var(--ink-900)' }}>{d.nomeDisciplina}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--ink-700)' }}>
                    {d.frequencia.percentualPresenca.toFixed(1)}% ({d.frequencia.faltas} faltas)
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
