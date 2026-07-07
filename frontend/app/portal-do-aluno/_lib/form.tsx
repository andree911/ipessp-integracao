// Reaproveita o padrão de Field/Input/CPF já usado em app/matricula/page.tsx.

export function maskCPF(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length > 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  if (d.length > 6) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  if (d.length > 3) return `${d.slice(0, 3)}.${d.slice(3)}`;
  return d;
}

export function validarCPF(cpf: string): boolean {
  const d = cpf.replace(/\D/g, '');
  if (d.length !== 11 || /^(\d)\1+$/.test(d)) return false;
  let s = 0;
  for (let i = 0; i < 9; i++) s += +d[i] * (10 - i);
  let r = (s * 10) % 11;
  if (r >= 10) r = 0;
  if (r !== +d[9]) return false;
  s = 0;
  for (let i = 0; i < 10; i++) s += +d[i] * (11 - i);
  r = (s * 10) % 11;
  if (r >= 10) r = 0;
  return r === +d[10];
}

export const inputCls = 'w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all';
export const inputStyle = { borderColor: 'var(--line)', color: 'var(--ink-900)', background: 'var(--surface-alt)' };
export const focusHandlers = {
  onFocus: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--brand-600)';
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--brand-100)';
    e.currentTarget.style.background = 'white';
  },
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--line)';
    e.currentTarget.style.boxShadow = 'none';
    e.currentTarget.style.background = 'var(--surface-alt)';
  },
};

export function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--ink-700)' }}>{label}</label>
      {children}
      {error && <p className="mt-1 text-xs" style={{ color: 'var(--brand-600)' }}>{error}</p>}
    </div>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={inputCls} style={inputStyle} {...focusHandlers} {...props} />;
}
