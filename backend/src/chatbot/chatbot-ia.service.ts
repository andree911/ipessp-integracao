import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { errMsg } from '../common/err.util';
import { TurnoConversa } from './chatbot-sessao.store';
import { PROMPT_CLASSIFICADOR, Trilha, TRILHAS } from './chatbot.prompts';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

interface RespostaMessages {
  content?: Array<{ type?: string; text?: string }>;
}

/**
 * Cliente da API de Mensagens da Anthropic.
 *
 * HTTP direto pelo `HttpService` que o projeto já usa (mesmo padrão de
 * SophiaService e WhatsAppService, e da suíte `test/bot/suites/classificador-ia.js`),
 * em vez de um SDK novo: são duas chamadas de formato fixo, e o SDK traria uma
 * dependência a mais só pra montar o mesmo JSON.
 */
@Injectable()
export class ChatbotIaService {
  private readonly logger = new Logger(ChatbotIaService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  get configurado(): boolean {
    return !!this.config.get<string>('chatbot.anthropicApiKey');
  }

  /**
   * Categoria da mensagem atual. `trilhaAnterior` entra no prompt porque é o
   * que permite ao modelo tratar continuação genérica ("sim", um CPF solto)
   * como parte da mesma conversa em vez de reiniciar o atendimento.
   */
  async classificar(
    mensagem: string,
    trilhaAnterior: Trilha | null,
  ): Promise<Trilha> {
    const texto =
      `Categoria da conversa até agora (pode não existir, ou não ter mais relação com a mensagem atual): ${trilhaAnterior ?? 'nenhuma'}\n\n` +
      `Mensagem atual do usuário: ${mensagem}`;

    const bruto = await this.chamar(PROMPT_CLASSIFICADOR, [
      { papel: 'user', texto },
    ]);
    return this.interpretarCategoria(bruto);
  }

  /** Uma resposta em texto puro, com o histórico da conversa como contexto. */
  async responder(
    system: string,
    historico: TurnoConversa[],
    maxTokens = 700,
  ): Promise<string> {
    return (await this.chamar(system, historico, maxTokens)).trim();
  }

  /**
   * Mesma chamada, mas com a resposta interpretada como JSON. Devolve `null`
   * quando o modelo não obedece ao formato — quem chama decide o fallback, em
   * vez de derrubar a mensagem do usuário.
   */
  async responderJson<T>(
    system: string,
    historico: TurnoConversa[],
    maxTokens = 700,
  ): Promise<T | null> {
    const bruto = await this.chamar(system, historico, maxTokens);
    // O prompt pede JSON puro, mas o modelo às vezes embrulha em ```json.
    const limpo = bruto
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '');
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio === -1 || fim <= inicio) {
      this.logger.warn(
        `Resposta sem JSON reconhecível: ${limpo.slice(0, 200)}`,
      );
      return null;
    }
    try {
      return JSON.parse(limpo.slice(inicio, fim + 1)) as T;
    } catch (err: unknown) {
      this.logger.warn(`JSON inválido do modelo: ${errMsg(err)}`);
      return null;
    }
  }

  /**
   * Normaliza a saída do classificador. Quando o modelo escreve uma frase em
   * vez de só a palavra, vale a ÚLTIMA categoria citada, não a primeira: uma
   * resposta como "não é financeiro, é lead" escolhia a categoria errada
   * quando a varredura era pela ordem da lista (bug real do nó "Interpretar
   * Categoria IA" no n8n).
   */
  private interpretarCategoria(bruto: string): Trilha {
    const limpo = bruto
      .toLowerCase()
      .replace(/[^a-z_\s]/g, ' ')
      .trim();
    const palavras = limpo.split(/\s+/);

    if (palavras.length === 1 && TRILHAS.includes(palavras[0] as Trilha)) {
      return palavras[0] as Trilha;
    }
    for (let i = palavras.length - 1; i >= 0; i--) {
      if (TRILHAS.includes(palavras[i] as Trilha)) return palavras[i] as Trilha;
    }
    return 'outro';
  }

  private async chamar(
    system: string,
    historico: TurnoConversa[],
    maxTokens = 700,
  ): Promise<string> {
    const apiKey = this.config.get<string>('chatbot.anthropicApiKey');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY não configurada');

    const resposta = await firstValueFrom(
      this.http.post<RespostaMessages>(
        API_URL,
        {
          model: this.config.get<string>('chatbot.modelo'),
          max_tokens: maxTokens,
          system,
          messages: historico.map((t) => ({
            role: t.papel === 'user' ? 'user' : 'assistant',
            content: t.texto,
          })),
        },
        {
          headers: {
            'content-type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': API_VERSION,
          },
          timeout: 30_000,
        },
      ),
    );

    return (resposta.data.content ?? [])
      .map((bloco) => bloco.text ?? '')
      .join('')
      .trim();
  }
}
