/**
 * A Sophia retorna datas de vencimento tanto em dd/mm/yyyy quanto em ISO
 * (yyyy-mm-dd, às vezes com hora/T). Em ambos os casos o valor representa uma
 * data de calendário, não um instante -- por isso os componentes ano/mês/dia
 * são sempre extraídos e montados em horário local, nunca via
 * `new Date(isoString)`: essa forma interpreta uma data sem hora como meia-
 * noite UTC, e o `.setHours(0,0,0,0)` aplicado depois pelos chamadores
 * desloca a data um dia para trás em qualquer servidor com fuso negativo
 * (ex: America/Sao_Paulo).
 */
export function parseDateBR(s: string): Date {
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s);
  if (br) {
    const [, d, m, y] = br;
    return new Date(+y, +m - 1, +d);
  }
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (iso) {
    const [, y, m, d] = iso;
    return new Date(+y, +m - 1, +d);
  }
  return new Date(s);
}

const FORMATADOR_DIA_BR = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/**
 * Compara duas datas pelo dia de calendário em America/Sao_Paulo -- mesmo
 * fuso em que os crons de cobrança (email/WhatsApp) são declarados. Usar
 * `toDateString()` aqui compararia pelo fuso do processo Node, que pode ser
 * UTC no servidor e deslocar a janela de deduplicação perto da meia-noite.
 */
export function mesmoDiaBR(a: Date, b: Date): boolean {
  return FORMATADOR_DIA_BR.format(a) === FORMATADOR_DIA_BR.format(b);
}
