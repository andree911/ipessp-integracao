'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Matricula {
  codigo: number;
  curso: string | null;
}

export default function HorarioPage() {
  const router = useRouter();
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [matriculaSelecionada, setMatriculaSelecionada] = useState<number | null>(null);
  const [dados, setDados] = useState<unknown>(null);
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
    fetch(`/api/portal/horario?matricula=${matriculaSelecionada}`)
      .then(async (res) => {
        if (res.status === 401) { router.push('/portal-do-aluno/login'); return; }
        const data = await res.json();
        if (!res.ok) { setErro((data as { message?: string }).message ?? 'Não foi possível carregar seu horário.'); return; }
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

      {!carregando && dados != null && (
        <pre
          className="p-4 rounded-xl border text-xs overflow-x-auto whitespace-pre-wrap"
          style={{ borderColor: 'var(--line)', background: 'var(--surface-alt)', color: 'var(--ink-900)' }}
        >
          {JSON.stringify(dados, null, 2)}
        </pre>
      )}
    </div>
  );
}
