import { parseDateBR } from './date.util';

export interface LancamentoLocalParaCasar {
  dataVencimento: string;
  valorPrevisto: number;
}

export interface LancamentoVivoParaCasar {
  codigo: number;
  recebido: number;
  dataVencimento: string;
  valorPrevisto: number;
}

const JANELA_DIAS = 45;
const JANELA_VALOR = 20;

/**
 * Acha, entre os lançamentos ao vivo da Sophia, quais podem ser o
 * "substituto" de um lançamento local cujo código não existe mais ao vivo.
 * A Sophia por vezes troca um lançamento por outro com código E vencimento
 * diferentes (não só o código) sem nunca marcar o antigo como pago — sem
 * essa janela, o antigo fica órfão pendente pra sempre no cache local.
 *
 * Janela de 45 dias / R$20 validada manualmente no incidente de 2026-08-12
 * (cliente Renata da Cruz Silva, cobrada por 5 semanas por um lançamento já
 * substituído e pago — ver memória do projeto). Só considera candidatos já
 * pagos (`recebido > 0`) e retorna TODOS os que passam no filtro — quem
 * chama decide o que fazer com mais de um resultado (ambíguo); esta função
 * nunca escolhe por conta própria.
 */
export function encontrarSubstitutosPagos(
  local: LancamentoLocalParaCasar,
  liveList: LancamentoVivoParaCasar[],
  codigosExcluidos: ReadonlySet<number> = new Set(),
): LancamentoVivoParaCasar[] {
  const vencLocal = parseDateBR(local.dataVencimento);
  if (isNaN(vencLocal.getTime())) return [];

  return liveList.filter((l) => {
    if (codigosExcluidos.has(l.codigo)) return false;
    if (!l.recebido || l.recebido <= 0) return false;
    const vencLive = parseDateBR(l.dataVencimento.substring(0, 10));
    if (isNaN(vencLive.getTime())) return false;
    const dias = Math.abs((vencLive.getTime() - vencLocal.getTime()) / 86_400_000);
    const diffValor = Math.abs(Number(l.valorPrevisto) - local.valorPrevisto);
    return dias <= JANELA_DIAS && diffValor <= JANELA_VALOR;
  });
}
