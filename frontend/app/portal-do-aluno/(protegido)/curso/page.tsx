'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Matricula {
  codigo: number;
  curso: string | null;
  turma: string | null;
  unidade: string | null;
  situacao: string | null;
  dataMatricula: string | null;
}

export default function CursoPage() {
  const router = useRouter();
  const [matriculas, setMatriculas] = useState<Matricula[] | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/portal/curso')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/portal-do-aluno/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setErro(data.message ?? 'Não foi possível carregar seus cursos.');
          return;
        }
        setMatriculas(data);
      })
      .catch(() => setErro('Não foi possível conectar. Tente novamente.'))
      .finally(() => setCarregando(false));
  }, [router]);

  if (carregando) return <p style={{ color: 'var(--ink-700)' }}>Carregando...</p>;
  if (erro) return <p style={{ color: 'var(--brand-600)' }}>{erro}</p>;
  if (!matriculas || matriculas.length === 0) {
    return <p style={{ color: 'var(--ink-700)' }}>Nenhuma matrícula encontrada.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {matriculas.map((m) => (
        <div key={m.codigo} className="p-4 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--surface-alt)' }}>
          <p className="font-medium" style={{ color: 'var(--ink-900)' }}>{m.curso ?? 'Curso não informado'}</p>
          <div className="text-xs mt-1 flex flex-wrap gap-x-4 gap-y-1" style={{ color: 'var(--ink-700)' }}>
            {m.turma && <span>Turma: {m.turma}</span>}
            {m.unidade && <span>Unidade: {m.unidade}</span>}
            {m.situacao && <span>Situação: {m.situacao}</span>}
            {m.dataMatricula && <span>Matriculado em: {m.dataMatricula}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
