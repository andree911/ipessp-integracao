import {
  Body,
  Controller,
  HttpCode,
  Logger,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WhatsAppJobService } from './whatsapp-job.service';
import { CanalWhatsApp } from './whatsapp.service';
import { errMsg } from '../common/err.util';

const OPCOES_COBRANCA = ['ja_paguei', 'ajuda', 'portal', 'site'];

/** "pagar_whatsapp:123" carrega o código do lançamento no id -- ver montarMensagem/cta em WhatsAppJobService. */
function ehOpcaoCobranca(selectedRowId: string): boolean {
  return (
    OPCOES_COBRANCA.includes(selectedRowId) ||
    selectedRowId.startsWith('pagar_whatsapp')
  );
}

interface ZApiWebhookPayload {
  fromMe?: boolean;
  phone?: string;
  text?: { message?: string };
  senderName?: string;
  listResponseMessage?: { selectedRowId?: string; title?: string };
  [key: string]: unknown;
}

/**
 * Recebe o webhook de mensagem recebida da Z-API direto no backend (decisão
 * de 2026-08-14: a resposta de cobrança precisa ser 100% backend, sem
 * depender de nenhum fluxo do n8n no caminho -- nem pra receber, nem pra
 * decidir, nem pra enviar). Sem guard de admin-key de propósito: quem chama
 * aqui é a Z-API, não um cliente autenticado nosso -- a origem é verificada
 * pelo secret na query string (ver verificarOrigem), não por Bearer token.
 *
 * Tudo que NÃO for uma das opções da lista de cobrança (OPCOES_COBRANCA) é repassado sem
 * alteração pro fluxo "Encaminhar Leads" do n8n, que continua cuidando de
 * leads normalmente -- só o dono do roteamento de ENTRADA mudou, a lógica de
 * lead em si continua 100% no n8n/Core, sem duplicar aqui.
 *
 * Dois canais, duas rotas: /whatsapp/webhook é o número de atendimento/chatbot
 * de sempre (canal "geral"); /whatsapp/webhook/financeiro é o número dedicado
 * da régua de cobrança (canal "financeiro", cadastrado como uma 2ª instância
 * na Z-API). Cada rota tem seu próprio secret -- ver verificarOrigem -- e
 * responderOpcaoCobranca sempre responde pelo MESMO canal em que a pergunta
 * chegou, pra não trocar de conversa no meio do caminho.
 */
@Controller('whatsapp')
export class WhatsAppWebhookController {
  private readonly logger = new Logger(WhatsAppWebhookController.name);

  constructor(
    private readonly whatsappJobService: WhatsAppJobService,
    private readonly config: ConfigService,
    private readonly http: HttpService,
  ) {}

  @Post('webhook')
  @HttpCode(200)
  async receberWebhookGeral(
    @Body() payload: ZApiWebhookPayload,
    @Query('secret') secret?: string,
  ): Promise<{ ok: boolean }> {
    return this.processarWebhook(payload, secret, 'geral');
  }

  @Post('webhook/financeiro')
  @HttpCode(200)
  async receberWebhookFinanceiro(
    @Body() payload: ZApiWebhookPayload,
    @Query('secret') secret?: string,
  ): Promise<{ ok: boolean }> {
    return this.processarWebhook(payload, secret, 'financeiro');
  }

  private async processarWebhook(
    payload: ZApiWebhookPayload,
    secret: string | undefined,
    canal: CanalWhatsApp,
  ): Promise<{ ok: boolean }> {
    this.verificarOrigem(secret, canal);

    // Mesmo filtro que só existia no n8n ("Filtro Modo Teste") -- em modo
    // teste, só o telefone de teste é processado; qualquer outro é
    // silenciosamente ignorado (nem responde cobrança, nem repassa lead).
    const modoTeste = this.config.get<string>('zapi.modoTeste') === 'true';
    const telefoneTeste = this.config.get<string>('zapi.telefoneTeste');
    if (modoTeste && payload.phone !== telefoneTeste) {
      return { ok: true };
    }

    if (payload.fromMe) return { ok: true };

    const selectedRowId = payload.listResponseMessage?.selectedRowId;
    if (selectedRowId && ehOpcaoCobranca(selectedRowId) && payload.phone) {
      try {
        await this.whatsappJobService.responderOpcaoCobranca(
          selectedRowId,
          payload.phone,
          canal,
        );
      } catch (err: unknown) {
        this.logger.error(
          `Falha ao responder opção "${selectedRowId}" pro telefone ${payload.phone}: ${errMsg(err)}`,
        );
      }
      return { ok: true };
    }

    await this.repassarParaN8n(payload);
    return { ok: true };
  }

  /**
   * A Z-API não assina o payload do webhook, então a única verificação de
   * origem possível é um secret compartilhado embutido na própria URL
   * cadastrada no painel da Z-API (ex: /whatsapp/webhook?secret=xxx). Cada
   * canal usa sua própria variável (WEBHOOK_SECRET / WEBHOOK_SECRET_FINANCEIRO)
   * -- são instâncias/números diferentes, não faz sentido compartilhar
   * segredo entre eles. Opcional por retrocompatibilidade: enquanto a
   * variável daquele canal não for configurada, o comportamento atual (sem
   * verificação) é preservado -- configure a env var e atualize a URL na
   * Z-API para ativar a checagem.
   */
  private verificarOrigem(
    secret: string | undefined,
    canal: CanalWhatsApp,
  ): void {
    const chave =
      canal === 'financeiro' ? 'webhook.secretFinanceiro' : 'webhook.secret';
    const esperado = this.config.get<string>(chave);
    if (!esperado) return;
    if (secret !== esperado) {
      throw new UnauthorizedException('Origem do webhook não verificada');
    }
  }

  /** Retry único após pequeno atraso -- mesmo padrão de WhatsAppService.enviarTexto, pra não perder um lead por instabilidade passageira do n8n. */
  private async repassarParaN8n(payload: ZApiWebhookPayload): Promise<void> {
    const url = this.config.get<string>('zapi.n8nWebhookUrl');
    if (!url) return;

    const enviar = () => firstValueFrom(this.http.post(url, payload));
    try {
      await enviar();
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        await enviar();
      } catch (err2: unknown) {
        this.logger.warn(
          `Falha ao repassar mensagem pro n8n (após retry) — telefone ${payload.phone}: ${errMsg(err2)}`,
        );
      }
    }
  }
}
