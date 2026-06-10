import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  RecivWebhookAcordo,
  RecivWebhookNegativacao,
  RecivWebhookPagamento,
} from '../receiv/types/receiv.types';

type RecivWebhookPayload =
  | RecivWebhookAcordo
  | RecivWebhookPagamento
  | RecivWebhookNegativacao;

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly config: ConfigService) {}

  @Post('receiv')
  @HttpCode(200)
  async handleReceiv(
    @Body() payload: RecivWebhookPayload,
    @Headers('x-webhook-secret') secret: string,
  ): Promise<{ ok: boolean }> {
    this.validateSecret(secret);

    switch (payload.evento) {
      case 'pagamento_registrado':
        this.onPagamento(payload as RecivWebhookPagamento);
        break;
      case 'acordo_efetivado':
        this.onAcordo('EFETIVADO', payload as RecivWebhookAcordo);
        break;
      case 'acordo_quebrado':
        this.onAcordo('QUEBRADO', payload as RecivWebhookAcordo);
        break;
      case 'negativacao_realizada':
        this.onNegativacao('REALIZADA', payload as RecivWebhookNegativacao);
        break;
      case 'negativacao_cancelada':
        this.onNegativacao('CANCELADA', payload as RecivWebhookNegativacao);
        break;
      default:
        this.logger.warn(`Evento desconhecido: ${(payload as any).evento}`);
    }

    return { ok: true };
  }

  private validateSecret(secret: string): void {
    const expected = this.config.get<string>('webhook.secret');
    if (expected && secret !== expected) {
      throw new UnauthorizedException('Webhook secret inválido');
    }
  }

  // Pagamento registrado na Receiv.
  // Não atualizamos o SophiA aqui pois o SophiA é o sistema de verdade para pagamentos:
  // quando o pagamento entrar no SophiA (situacao='P'), o job de sync enviará a baixa
  // automaticamente na próxima execução.
  private onPagamento(payload: RecivWebhookPagamento): void {
    const lancamento = payload.integ_id_titulo.replace('lancamento-', '');
    this.logger.log(
      `[PAGAMENTO] lançamento=${lancamento} | valor=${payload.valor_pago} | data=${payload.data_pagamento}`,
    );
  }

  private onAcordo(tipo: 'EFETIVADO' | 'QUEBRADO', payload: RecivWebhookAcordo): void {
    const lancamentos = payload.integ_ids_titulos
      .map((id) => id.replace('lancamento-', ''))
      .join(', ');
    this.logger.log(
      `[ACORDO ${tipo}] cliente=${payload.integ_id_cliente} | lançamentos=${lancamentos} | valor=${payload.valor_total} | data=${payload.data_acordo}`,
    );
    if (payload.parcelas?.length) {
      payload.parcelas.forEach((p, i) =>
        this.logger.log(`  parcela ${i + 1}: venc=${p.vencimento} valor=${p.valor}`),
      );
    }
  }

  private onNegativacao(tipo: 'REALIZADA' | 'CANCELADA', payload: RecivWebhookNegativacao): void {
    const lancamentos = payload.integ_ids_titulos
      .map((id) => id.replace('lancamento-', ''))
      .join(', ');
    this.logger.log(
      `[NEGATIVAÇÃO ${tipo}] cliente=${payload.integ_id_cliente} | lançamentos=${lancamentos} | data=${payload.data_evento}`,
    );
  }
}
