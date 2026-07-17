import { Body, Controller, Headers, HttpCode, Logger, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import { MercadoPagoService } from './mercadopago.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../email/whatsapp.service';
import { SophiaService } from '../sophia/sophia.service';
import { MatriculaCache } from '../matriculas/entities/matricula-cache.entity';
import { errMsg, axiosDetail } from '../common/err.util';

interface MpPayment {
  id?: string | number | null;
  status?: string | null;
  external_reference?: string | null;
  transaction_amount?: number | null;
  date_approved?: string | null;
  payment_type_id?: string | null;
  payer?: { first_name?: string; last_name?: string; email?: string };
}

@Controller('v1/pagamentos')
export class MercadoPagoController {
  private readonly logger = new Logger(MercadoPagoController.name);

  constructor(
    @InjectRepository(MatriculaCache)
    private readonly cacheRepo: Repository<MatriculaCache>,
    private readonly mp: MercadoPagoService,
    private readonly email: EmailService,
    private readonly whatsapp: WhatsAppService,
    private readonly sophia: SophiaService,
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
    if (!secret) {
      this.logger.warn('MP webhook recebido mas MP_WEBHOOK_SECRET não configurado — rejeitado');
      return { ok: true };
    }
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
    } catch (err: unknown) {
      this.logger.error(`Erro ao processar webhook MP: ${errMsg(err)}`);
    }

    return { ok: true };
  }

  private async notificarPagamentoAprovado(pagamento: MpPayment): Promise<void> {
    const ref = String(pagamento.external_reference ?? '');
    const cache = ref ? await this.cacheRepo.findOne({ where: { externalReference: ref } }) : null;

    // Trava de idempotência: o Mercado Pago pode reentregar o mesmo webhook mais de
    // uma vez, inclusive quase simultaneamente. Um UPDATE condicional atômico (em vez
    // de ler notificadoEm e só gravar no final) fecha a janela de corrida — só uma
    // execução consegue "reivindicar" a linha; a outra sai sem duplicar o cliente no Sophia.
    if (cache) {
      const claim = await this.cacheRepo.update(
        { id: cache.id, notificadoEm: IsNull() },
        { notificadoEm: new Date() },
      );
      if (claim.affected === 0) {
        this.logger.log(`Webhook duplicado ignorado para ref=${ref} (corrida com outra execução)`);
        return;
      }
    }

    // Cria o cliente/prospecto automaticamente no Sophia — a secretaria só precisa
    // conferir e efetivar a matrícula (conversão cliente→aluno é manual, sem endpoint
    // de API pra isso). Ver documentacao/BACKEND.md, seção "Matrícula + pagamento".
    let codigoClienteSophia: number | null = null;
    let erroSophia: string | null = null;
    if (cache?.cpfAluno && cache?.nomeAluno) {
      try {
        const resultado = await this.sophia.criarCliente({
          nome: cache.nomeAluno,
          cpf: cache.cpfAluno,
          email: cache.emailAluno ?? undefined,
          telefone: cache.telefoneAluno ?? undefined,
          sexo: (cache.sexoAluno as 'M' | 'F') ?? undefined,
          dataNascimento: cache.dataNascimentoAluno ?? undefined,
          observacao: `Matrícula via site — pagamento MP aprovado (id ${pagamento.id}, ref ${ref}).`,
          unidade: cache.unidade ?? undefined,
          curso: cache.curso ?? undefined,
          turno: cache.turno ?? undefined,
          periodoLetivo: cache.periodoLetivo ?? undefined,
        });
        codigoClienteSophia = (resultado as { codigo?: number })?.codigo ?? null;
        this.logger.log(`Cliente criado no Sophia para ref=${ref}: ${JSON.stringify(resultado)}`);
      } catch (err: unknown) {
        erroSophia = JSON.stringify(axiosDetail(err));
        this.logger.error(`Falha ao criar cliente no Sophia para ref=${ref}: ${erroSophia}`);
      }
    } else {
      erroSophia = 'Dados insuficientes em MatriculaCache (nome/CPF do aluno ausentes) — não foi possível criar o cliente automaticamente.';
      this.logger.warn(`notificarPagamentoAprovado: ${erroSophia} (ref=${ref})`);
    }

    const payer = pagamento.payer ?? {};
    const nomeAluno = cache?.nomeAluno || [payer.first_name, payer.last_name].filter(Boolean).join(' ') || 'N/A';
    const curso = cache?.curso || 'N/A';
    const valor = pagamento.transaction_amount != null
      ? `R$ ${Number(pagamento.transaction_amount).toFixed(2).replace('.', ',')}`
      : 'N/A';
    const dataAprovacao = pagamento.date_approved
      ? new Date(pagamento.date_approved).toLocaleString('pt-BR')
      : new Date().toLocaleString('pt-BR');

    this.logger.log(`Pagamento aprovado: id=${pagamento.id} aluno=${nomeAluno} curso=${curso} valor=${valor}`);

    const fmt = (v?: number | string | null) =>
      v != null ? `R$ ${Number(v).toFixed(2).replace('.', ',')}` : 'N/A';

    // WhatsApp para o financeiro
    const statusSophia = codigoClienteSophia
      ? `✅ Cliente já criado no Sophia — código *${codigoClienteSophia}*. Só efetivar a matrícula.`
      : `⚠️ Falha ao criar cliente automaticamente no Sophia: ${erroSophia}. Cadastre manualmente com os dados abaixo.`;

    const telefoneFinanceiro = this.config.get<string>('zapi.telefoneFinanceiro');
    if (telefoneFinanceiro) {
      const msg = [
        `✅ *Pagamento aprovado — registrar matrícula no Sophia*`,
        ``,
        statusSophia,
        ``,
        `*Aluno:* ${nomeAluno}`,
        `*CPF:* ${cache?.cpfAluno || 'N/A'}`,
        `*Email:* ${cache?.emailAluno || payer.email || 'N/A'}`,
        `*Telefone:* ${cache?.telefoneAluno || 'N/A'}`,
        cache?.nomeResponsavel ? `*Responsável:* ${cache.nomeResponsavel} (${cache.cpfResponsavel || 'N/A'})` : null,
        ``,
        `*Curso:* ${curso}`,
        `*Unidade:* ${cache?.unidade || 'N/A'}`,
        `*Turno:* ${cache?.turno || 'N/A'}`,
        `*Período letivo:* ${cache?.periodoLetivo || 'N/A'}`,
        cache?.curriculo ? `*Currículo:* ${cache.curriculo}` : null,
        ``,
        `*Plano:* ${cache ? `${cache.numeroParcelas}x de ${fmt(cache.valorParcela)}` : 'N/A'}`,
        `*Valor pago:* ${valor}`,
        `*Data aprovação:* ${dataAprovacao}`,
        `*ID MP:* ${pagamento.id}`,
      ].filter((l) => l !== null).join('\n');
      try {
        await this.whatsapp.enviarTexto(telefoneFinanceiro, msg);
      } catch (err: unknown) {
        this.logger.warn(`WhatsApp financeiro falhou: ${errMsg(err)}`);
      }
    }

    // Email para o financeiro com todos os dados para registrar no Sophia
    const emailNotificacoes = this.config.get<string>('email.emailNotificacoes');
    if (emailNotificacoes) {
      const l = (label: string, v: string) =>
        `<tr><td style="padding:8px;border:1px solid #ddd;background:#f9f9f9;font-weight:bold;width:200px">${label}</td><td style="padding:8px;border:1px solid #ddd">${v}</td></tr>`;
      const secao = (titulo: string) =>
        `<tr><td colspan="2" style="padding:10px 8px 4px;background:#7C2529;color:#fff;font-weight:bold;font-size:13px">${titulo}</td></tr>`;
      const html = `
        <div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto">
          <h2 style="color:#1f9d55;margin-bottom:4px">✅ Pagamento Aprovado — Registrar Matrícula no Sophia</h2>
          <p style="color:#555;margin-top:0">Data de aprovação: <strong>${dataAprovacao}</strong> &nbsp;|&nbsp; Valor pago: <strong>${valor}</strong> &nbsp;|&nbsp; ID MP: <strong>${pagamento.id}</strong></p>
          <p style="padding:12px 16px;border-radius:8px;font-size:14px;background:${codigoClienteSophia ? '#eafaf1' : '#fdf5f5'};color:${codigoClienteSophia ? '#1f9d55' : '#C8102E'}">
            ${codigoClienteSophia
              ? `✅ Cliente já criado no Sophia — código <strong>${codigoClienteSophia}</strong>. Só efetivar a matrícula.`
              : `⚠️ Falha ao criar cliente automaticamente no Sophia: ${erroSophia}. Cadastre manualmente com os dados abaixo.`}
          </p>
          <table style="border-collapse:collapse;width:100%;font-size:14px">
            ${secao('Dados do Aluno')}
            ${l('Nome', cache?.nomeAluno || 'N/A')}
            ${l('CPF', cache?.cpfAluno || 'N/A')}
            ${l('Email', cache?.emailAluno || payer.email || 'N/A')}
            ${l('Telefone', cache?.telefoneAluno || 'N/A')}
            ${l('Sexo', cache?.sexoAluno || 'N/A')}
            ${l('Data de nascimento', cache?.dataNascimentoAluno || 'N/A')}
            ${cache?.nomeResponsavel ? secao('Responsável Financeiro') : ''}
            ${cache?.nomeResponsavel ? l('Nome', cache.nomeResponsavel) : ''}
            ${cache?.cpfResponsavel ? l('CPF', cache.cpfResponsavel) : ''}
            ${cache?.emailResponsavel ? l('Email', cache.emailResponsavel) : ''}
            ${cache?.telefoneResponsavel ? l('Telefone', cache.telefoneResponsavel) : ''}
            ${secao('Dados do Curso')}
            ${l('Curso', cache?.curso || 'N/A')}
            ${l('Unidade', cache?.unidade || 'N/A')}
            ${l('Turno', cache?.turno || 'N/A')}
            ${l('Período letivo', cache?.periodoLetivo || 'N/A')}
            ${cache?.curriculo ? l('Currículo', cache.curriculo) : ''}
            ${secao('Plano de Pagamento')}
            ${l('Parcelas', cache ? `${cache.numeroParcelas}x de ${fmt(cache.valorParcela)}` : 'N/A')}
            ${l('1ª parcela', cache?.dataPrimeiraParcela || 'N/A')}
            ${cache?.desconto ? l('Desconto', cache.desconto) : ''}
            ${l('Valor pago (MP)', valor)}
            ${l('Forma de pagamento', pagamento.payment_type_id || 'N/A')}
          </table>
          <p style="margin-top:16px;color:#555;font-size:13px">Acesse o Sophia e registre a matrícula com os dados acima.</p>
        </div>
      `;
      try {
        await this.email.enviar(
          emailNotificacoes,
          `✅ Registrar Matrícula — ${nomeAluno} | ${curso} — ${valor}`,
          html,
        );
      } catch (err: unknown) {
        this.logger.warn(`Email financeiro falhou: ${errMsg(err)}`);
      }
    }

    if (cache) {
      await this.cacheRepo.update(cache.id, { codigoClienteSophia });
    }
  }
}
