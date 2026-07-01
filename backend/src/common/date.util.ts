// Sophia retorna datas em dd/mm/yyyy — new Date() interpreta como MM/DD e erra o mês
export function parseDateBR(s: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return new Date(+y, +m - 1, +d);
  }
  return new Date(s);
}
