'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Pendencia {
  codigo: number;
  descricao: string;
  vencimento: string;
  valor: number;
  diasAtraso: number;
  linhaDigitavel?: string;
  urlBoleto?: string;
  codigoPix?: string;
  codigoBoleto?: number;
  competencia?: string;
}

interface FinanceiroData {
  nomeAluno: string;
  pendencias: Pendencia[];
}

const formatBRL = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const formatData = (iso: string) => {
  const [ano, mes, dia] = iso.substring(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
};

export default function FinanceiroPage() {
  const router = useRouter();
  const [dados, setDados] = useState<FinanceiroData | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch('/api/portal/financeiro')
      .then(async (res) => {
        if (res.status === 401) {
          router.push('/portal-do-aluno/login');
          return;
        }
        const data = await res.json();
        if (!res.ok) {
          setErro(data.message ?? 'Não foi possível carregar seus dados financeiros.');
          return;
        }
        setDados(data);
      })
      .catch(() => setErro('Não foi possível conectar. Tente novamente.'))
      .finally(() => setCarregando(false));
  }, [router]);

  if (carregando) return <p style={{ color: 'var(--ink-700)' }}>Carregando...</p>;
  if (erro) return <p style={{ color: 'var(--brand-600)' }}>{erro}</p>;
  if (!dados) return null;

  if (dados.pendencias.length === 0) {
    return <p style={{ color: 'var(--ink-700)' }}>Nenhuma pendência financeira em aberto. 🎉</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {dados.pendencias.map((p) => (
        <div
          key={p.codigo}
          className="p-4 rounded-xl border flex items-center justify-between gap-4"
          style={{ borderColor: 'var(--line)', background: 'var(--surface-alt)' }}
        >
          <div>
            <p className="font-medium" style={{ color: 'var(--ink-900)' }}>{p.descricao}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--ink-700)' }}>
              Vencimento: {formatData(p.vencimento)}
              {p.diasAtraso > 0 && <span style={{ color: 'var(--brand-600)' }}> · {p.diasAtraso} dia(s) em atraso</span>}
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>{formatBRL(p.valor)}</p>
            {p.urlBoleto && (
              <a href={p.urlBoleto} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: 'var(--brand-600)' }}>
                Ver boleto
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
