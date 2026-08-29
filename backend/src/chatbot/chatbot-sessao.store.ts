import { Injectable } from '@nestjs/common';
import { Trilha } from './chatbot.prompts';

/** Turno guardado no histórico enviado ao modelo. */
export interface TurnoConversa {
  papel: 'user' | 'assistant';
  texto: string;
}

export interface SessaoChatbot {
  /** Última atividade — base do TTL. */
  atualizadaEm: number;
  /** A saudação inicial já foi enviada nesta sessão. */
  saudada: boolean;
  /** Categoria em que a conversa está, usada como desempate pelo classificador em continuações genéricas. */
  trilha: Trilha | null;
  /** CPF já confirmado nesta conversa (ou vindo do cache telefone→CPF). */
  cpf: string | null;
  /** O texto de boas-vindas da triagem já foi enviado. */
  leadSaudado: boolean;
  /** Lead já registrado no CRM nesta sessão — evita registrar de novo a cada mensagem. */
  leadRegistrado: boolean;
  historico: TurnoConversa[];
}

/** Conversa parada por mais que isso recomeça do zero (com saudação). Mesma janela do fluxo n8n. */
const TTL_MS = 6 * 60 * 60 * 1000;

/** Turnos mantidos no histórico enviado ao modelo — o suficiente pra coletar os 3 dados do lead sem inflar o prompt. */
const MAX_TURNOS = 20;

/**
 * Estado de conversa por telefone, em memória.
 *
 * Substitui o `$getWorkflowStaticData('global')` do n8n, que também era
 * memória do processo — não é uma regressão de durabilidade. Vale a limitação
 * herdada: com mais de uma réplica do container, cada uma teria sua própria
 * cópia; hoje o deploy roda instância única (ver CONTEXT.md, "Deploy"). Se um
 * dia escalar horizontalmente, este é o único ponto que precisa virar tabela
 * ou Redis — o resto do chatbot não guarda estado.
 */
@Injectable()
export class ChatbotSessaoStore {
  private readonly sessoes = new Map<string, SessaoChatbot>();

  /** Devolve a sessão viva do telefone, ou uma nova (também quando a anterior passou do TTL). */
  obter(telefone: string): SessaoChatbot {
    this.limparExpiradas();

    const atual = this.sessoes.get(telefone);
    if (atual && Date.now() - atual.atualizadaEm < TTL_MS) {
      atual.atualizadaEm = Date.now();
      return atual;
    }

    const nova: SessaoChatbot = {
      atualizadaEm: Date.now(),
      saudada: false,
      trilha: null,
      cpf: null,
      leadSaudado: false,
      leadRegistrado: false,
      historico: [],
    };
    this.sessoes.set(telefone, nova);
    return nova;
  }

  registrarTurno(
    sessao: SessaoChatbot,
    papel: TurnoConversa['papel'],
    texto: string,
  ): void {
    if (!texto) return;
    sessao.historico.push({ papel, texto });
    if (sessao.historico.length > MAX_TURNOS) {
      sessao.historico.splice(0, sessao.historico.length - MAX_TURNOS);
    }
    sessao.atualizadaEm = Date.now();
  }

  /**
   * Varre o mapa inteiro a cada mensagem recebida. É O(n) sobre as conversas
   * abertas, mas n aqui são dezenas — não vale um cron só pra isso, e sem a
   * varredura o mapa cresceria indefinidamente com telefone que nunca volta.
   */
  private limparExpiradas(): void {
    const agora = Date.now();
    for (const [telefone, sessao] of this.sessoes) {
      if (agora - sessao.atualizadaEm >= TTL_MS) this.sessoes.delete(telefone);
    }
  }
}
