'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

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

function BotaoCopiar({ valor }: { valor: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard indisponível (ex.: contexto não-seguro) — sem fallback,
      // o texto já fica visível e selecionável pra copiar manualmente.
    }
  }

  return (
    <button
      onClick={copiar}
      className="text-xs font-medium px-2 py-1 rounded-md shrink-0"
      style={{ color: 'var(--brand-600)', background: 'var(--brand-50)' }}
    >
      {copiado ? 'Copiado!' : 'Copiar'}
    </button>
  );
}

function DetalhePendencia({ p }: { p: Pendencia }) {
  return (
    <div className="px-4 pb-4 flex flex-col gap-3">
      {p.competencia && (
        <p className="text-xs" style={{ color: 'var(--ink-700)' }}>Competência: {p.competencia}</p>
      )}

      {p.codigoPix && (
        <div className="flex flex-col sm:flex-row gap-3 items-start p-3 rounded-lg border" style={{ borderColor: 'var(--line)' }}>
          <div className="p-2 rounded-md bg-white shrink-0">
            <QRCodeSVG value={p.codigoPix} size={140} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-xs font-medium uppercase" style={{ color: 'var(--ink-700)' }}>Pix copia e cola</p>
              <BotaoCopiar valor={p.codigoPix} />
            </div>
            <p className="text-xs break-all font-mono" style={{ color: 'var(--ink-900)' }}>{p.codigoPix}</p>
          </div>
        </div>
      )}

      {p.linhaDigitavel && (
        <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--line)' }}>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xs font-medium uppercase" style={{ color: 'var(--ink-700)' }}>Linha digitável do boleto</p>
            <BotaoCopiar valor={p.linhaDigitavel} />
          </div>
          <p className="text-xs break-all font-mono" style={{ color: 'var(--ink-900)' }}>{p.linhaDigitavel}</p>
        </div>
      )}

      {p.urlBoleto && (
        <a
          href={p.urlBoleto}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline w-fit"
          style={{ color: 'var(--brand-600)' }}
        >
          Abrir boleto em PDF
        </a>
      )}
    </div>
  );
}

export default function FinanceiroPage() {
  const router = useRouter();
  const [dados, setDados] = useState<FinanceiroData | null>(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [expandido, setExpandido] = useState<number | null>(null);

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
      {dados.pendencias.map((p) => {
        const temDetalhe = !!(p.codigoPix || p.linhaDigitavel || p.urlBoleto || p.competencia);
        const aberto = expandido === p.codigo;
        return (
          <div key={p.codigo} className="rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--surface-alt)' }}>
            <button
              onClick={() => temDetalhe && setExpandido(aberto ? null : p.codigo)}
              className="w-full p-4 flex items-center justify-between gap-4 text-left"
              style={{ cursor: temDetalhe ? 'pointer' : 'default' }}
            >
              <div>
                <p className="font-medium" style={{ color: 'var(--ink-900)' }}>{p.descricao}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--ink-700)' }}>
                  Vencimento: {formatData(p.vencimento)}
                  {p.diasAtraso > 0 && <span style={{ color: 'var(--brand-600)' }}> · {p.diasAtraso} dia(s) em atraso</span>}
                </p>
              </div>
              <div className="text-right shrink-0 flex items-center gap-3">
                <p className="font-semibold" style={{ color: 'var(--ink-900)' }}>{formatBRL(p.valor)}</p>
                {temDetalhe && (
                  <span
                    className="text-xs transition-transform"
                    style={{ color: 'var(--ink-500)', transform: aberto ? 'rotate(180deg)' : 'none' }}
                  >
                    ▼
                  </span>
                )}
              </div>
            </button>
            {aberto && temDetalhe && <DetalhePendencia p={p} />}
          </div>
        );
      })}
    </div>
  );
}
