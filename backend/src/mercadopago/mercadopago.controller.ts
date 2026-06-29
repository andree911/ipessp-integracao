import { Body, Controller, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { MercadoPagoService } from './mercadopago.service';

@Controller('v1/pagamentos')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(private readonly mp: MercadoPagoService) {}

  // Webhook chamado pelo Mercado Pago ao atualizar status de pagamento
  @Post('mp-webhook')
  @HttpCode(200)
  async webhook(
    @Query('id') id: string,
    @Query('topic') topic: string,
    @Body() body: Record<string, unknown>,
  ) {
    this.logger.log(`MP webhook: topic=${topic} id=${id} body=${JSON.stringify(body)}`);

    // MP envia notificações de diferentes tipos (payment, merchant_order, etc.)
    const paymentId = id ?? (body?.data as any)?.id;
    if (!paymentId || (topic !== 'payment' && body?.type !== 'payment')) {
      return { ok: true };
    }

    try {
      const pagamento = await this.mp.buscarPagamento(String(paymentId));
      this.logger.log(
        `MP pagamento ${paymentId}: status=${pagamento.status} ref=${pagamento.external_reference}`,
      );
      // TODO: ao confirmar pagamento (status === 'approved'), acionar financeiro
      // para registrar plano e gerar NF no Sophia via evento/fila
    } catch (err: any) {
      this.logger.error(`Erro ao processar webhook MP: ${err.message}`);
    }

    return { ok: true };
  }
}
