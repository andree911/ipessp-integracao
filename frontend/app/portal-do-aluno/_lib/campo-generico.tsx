// Renderiza qualquer valor (primitivo, objeto ou array, em qualquer
// profundidade) como lista de campo:valor. Usado por notas/page.tsx e
// horario/page.tsx enquanto o formato real de "etapas"/"disciplinas" não é
// confirmado com dados da Sophia (ver comentário nessas páginas) — assim
// que a escola lançar notas/horário, isso já renderiza algo legível sem
// precisar mexer no código, mesmo que venha aninhado.

function formatarValor(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(v)) {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toLocaleDateString('pt-BR');
  }
  return String(v);
}

export function CampoGenerico({ item }: { item: unknown }) {
  if (item === null || item === undefined) {
    return <span style={{ color: 'var(--ink-500)' }}>—</span>;
  }

  if (Array.isArray(item)) {
    if (item.length === 0) return <span style={{ color: 'var(--ink-500)' }}>—</span>;
    return (
      <div className="flex flex-col gap-2">
        {item.map((sub, i) => (
          <div key={i} className="pl-3 border-l" style={{ borderColor: 'var(--line)' }}>
            <CampoGenerico item={sub} />
          </div>
        ))}
      </div>
    );
  }

  if (typeof item === 'object') {
    return (
      <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        {Object.entries(item as Record<string, unknown>).map(([k, v]) => (
          <div key={k} className="contents">
            <span style={{ color: 'var(--ink-500)' }}>{k}</span>
            {typeof v === 'object' && v !== null ? (
              <CampoGenerico item={v} />
            ) : (
              <span style={{ color: 'var(--ink-900)' }}>{formatarValor(v)}</span>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <span className="text-sm" style={{ color: 'var(--ink-900)' }}>{formatarValor(item)}</span>;
}
