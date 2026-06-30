import { Body, Controller, Headers, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { MercadoPagoService } from './mercadopago.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../email/whatsapp.service';
import { MatriculaCache } from '../matriculas/entities/matricula-cache.entity';

@Controller('v1/pagamentos')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(
    @InjectRepository(MatriculaCache)
    private readonly cacheRepo: Repository<MatriculaCache>,
    private readonly mp: MercadoPagoService,
    private readonly email: EmailService,
    private readonly whatsapp: WhatsAppService,
    private readonly config: ConfigService,
  ) {}

  @Post('mp-webhook')
  @HttpCode(200)
  async webhook(
    @Query('id') id: string,
    @Query('topic') topic: string,
    @Body() body: Record<string, unknown>,
    @Headers('x-signature') xSignature?: string,
    @Headers('x-request-id') xRequestId?: string,
  ) {
    this.logger.log(`MP webhook: topic=${topic} id=${id} body=${JSON.stringify(body)}`);

    const paymentId = String(id ?? (body?.data as Record<string, unknown>)?.id ?? '');

    const secret = this.config.get<string>('mercadopago.webhookSecret');
    if (secret) {
      if (!xSignature) {
        this.logger.warn('MP webhook recebido sem header x-signature — ignorado');
        return { ok: true };
      }
      const ts = xSignature.match(/ts=(\d+)/)?.[1];
      const v1 = xSignature.match(/v1=([a-f0-9]+)/)?.[1];
      if (!ts || !v1) {
        this.logger.warn('MP webhook com x-signature malformado — ignorado');
        return { ok: true };
      }
      const template = `id:${paymentId};request-id:${xRequestId ?? ''};ts:${ts}`;
      const hash = createHmac('sha256', secret).update(template).digest('hex');
      if (hash !== v1) {
        this.logger.warn('MP webhook: assinatura inválida — ignorado');
        return { ok: true };
      }
    }

    if (!paymentId || (topic !== 'payment' && body?.type !== 'payment')) {
      return { ok: true };
    }

    try {
      const pagamento = await this.mp.buscarPagamento(paymentId);
      this.logger.log(
        `MP pagamento ${paymentId}: status=${pagamento.status} ref=${pagamento.external_reference}`,
      );

      if (pagamento.status === 'approved') {
        await this.notificarPagamentoAprovado(pagamento);
      }
    } catch (err: any) {
      this.logger.error(`Erro ao processar webhook MP: ${err.message}`);
    }

    return { ok: true };
  }

  private async notificarPagamentoAprovado(pagamento: any): Promise<void> {
    const ref = String(pagamento.external_reference ?? '');
    const match = ref.match(/^matricula-(\d+)-\d+$/);
    const codigoAluno = match?.[1] ?? 'desconhecido';

    // Busca dados completos da matrícula no cache local
    const cache = ref ? await this.cacheRepo.findOne({ where: { externalReference: ref } }) : null;

    const payer = pagamento.payer ?? {};
    const nomeResponsavel =
      cache?.nomeResponsavel ||
      [payer.first_name, payer.last_name].filter(Boolean).join(' ') ||
      'N/A';
    const emailResponsavel = cache?.emailResponsavel || payer.email || 'N/A';
    const nomeAluno = cache?.nomeAluno || `Código ${codigoAluno}`;
    const curso = cache?.curso || 'N/A';
    const plano = cache
      ? `${cache.numeroParcelas}x de R$ ${Number(cache.valorParcela).toFixed(2).replace('.', ',')}`
      : 'N/A';

    const valor =
      pagamento.transaction_amount != null
        ? `R$ ${Number(pagamento.transaction_amount).toFixed(2).replace('.', ',')}`
        : 'N/A';
    const dataAprovacao = pagamento.date_approved
      ? new Date(pagamento.date_approved).toLocaleString('pt-BR')
      : new Date().toLocaleString('pt-BR');
    const metodoPagamento = pagamento.payment_type_id ?? 'N/A';

    this.logger.log(
      `Pagamento aprovado: id=${pagamento.id} aluno=${codigoAluno} curso=${curso} valor=${valor}`,
    );

    // Notificação para o financeiro via WhatsApp
    const telefoneFinanceiro = this.config.get<string>('zapi.telefoneFinanceiro');
    if (telefoneFinanceiro) {
      const msg = [
        `✅ *Pagamento aprovado — Mercado Pago*`,
        ``,
        `*Aluno:* ${nomeAluno} (Sophia: ${codigoAluno})`,
        `*Curso:* ${curso}`,
        `*Plano:* ${plano}`,
        `*Responsável/Pagador:* ${nomeResponsavel}`,
        `*Email:* ${emailResponsavel}`,
        `*Valor pago:* ${valor}`,
        `*Forma de pagamento:* ${metodoPagamento}`,
        `*Data aprovação:* ${dataAprovacao}`,
        `*ID MP:* ${pagamento.id}`,
        ``,
        `Acesse o Sophia para registrar o plano de pagamento.`,
      ].join('\n');
      try {
        await this.whatsapp.enviarTexto(telefoneFinanceiro, msg);
      } catch (err: any) {
        this.logger.warn(`WhatsApp financeiro falhou: ${err.message}`);
      }
    }

    // Notificação para o financeiro via email
    const emailNotificacoes = this.config.get<string>('email.emailNotificacoes');
    if (emailNotificacoes) {
      const linha = (label: string, valor: string) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;background:#f9f9f9">${label}</td><td style="padding:8px;border:1px solid #ddd">${valor}</td></tr>`;
      const html = `
        <h2 style="color:#1f9d55">✅ Pagamento Aprovado — Mercado Pago</h2>
        <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">
          ${linha('Aluno', nomeAluno)}
          ${linha('Cód. Sophia', codigoAluno)}
          ${linha('Curso', curso)}
          ${linha('Plano', plano)}
          ${linha('Responsável/Pagador', nomeResponsavel)}
          ${linha('Email', emailResponsavel)}
          ${linha('Valor pago', valor)}
          ${linha('Forma de pagamento', metodoPagamento)}
          ${linha('Data aprovação', dataAprovacao)}
          ${linha('ID pagamento MP', String(pagamento.id))}
          ${linha('Referência', ref)}
        </table>
        <p style="margin-top:16px;color:#555">Acesse o Sophia para registrar o plano de pagamento deste aluno.</p>
      `;
      try {
        await this.email.enviar(
          emailNotificacoes,
          `✅ Pagamento Aprovado — ${nomeAluno} | ${curso} — ${valor}`,
          html,
        );
      } catch (err: any) {
        this.logger.warn(`Email financeiro falhou: ${err.message}`);
      }
    }
  }
}
