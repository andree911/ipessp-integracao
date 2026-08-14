import { Body, Controller, HttpCode, Logger, Post } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WhatsAppJobService } from './whatsapp-job.service';
import { errMsg } from '../common/err.util';

const OPCOES_COBRANCA = ['ja_paguei', 'ajuda', 'portal'];

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
 * aqui é a Z-API, não um cliente autenticado nosso.
 *
 * Tudo que NÃO for uma das 3 opções da lista de cobrança é repassado sem
 * alteração pro fluxo "Encaminhar Leads" do n8n, que continua cuidando de
 * leads normalmente -- só o dono do roteamento de ENTRADA mudou, a lógica de
 * lead em si continua 100% no n8n/Core, sem duplicar aqui.
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
  async receberWebhook(@Body() payload: ZApiWebhookPayload): Promise<{ ok: boolean }> {
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
    if (selectedRowId && OPCOES_COBRANCA.includes(selectedRowId) && payload.phone) {
      try {
        await this.whatsappJobService.responderOpcaoCobranca(selectedRowId, payload.phone);
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
