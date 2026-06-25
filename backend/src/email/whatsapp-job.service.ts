import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { WhatsAppService } from './whatsapp.service';
import { EmailLog } from './entities/email-log.entity';

function parseDateBR(s: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return new Date(+y, +m - 1, +d);
  }
  return new Date(s);
}

type WppTipo = 'wpp_lembrete' | 'wpp_vencimento_hoje' | 'wpp_cobranca';
type TipoBase = 'lembrete' | 'vencimento_hoje' | 'cobranca';

interface MensagemDados {
  nomeResponsavel: string;
  nomeAluno: string;
  valor: string;
  vencimento: string;
  diasRestantes?: number;
  diasAtraso?: number;
  competencia?: string;
  codigoPix?: string;
  urlBoleto?: string;
  telefoneEscola: string;
  nomeEscola: string;
}

@Injectable()
export class WhatsAppJobService {
  private readonly logger = new Logger(WhatsAppJobService.name);

  constructor(
    private readonly financeiro: FinanceiroService,
    private readonly whatsapp: WhatsAppService,
    private readonly config: ConfigService,
    @InjectRepository(EmailLog)
    private readonly logRepo: Repository<EmailLog>,
  ) {}

  private formatarCompetencia(competencia: string): string {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    const match = competencia.match(/(\d{4})[-/](\d{2})|(\d{2})[-/](\d{4})/);
    if (!match) return competencia;
    const ano = match[1] ?? match[4];
    const mes = match[2] ?? match[3];
    const idx = parseInt(mes, 10) - 1;
    return idx >= 0 && idx < 12 ? `${meses[idx]}/${ano}` : competencia;
  }

  private montarMensagem(tipo: TipoBase, d: MensagemDados): string {
    const comp = d.competencia ? ` (${d.competencia})` : '';
    const pagamento = [
      d.codigoPix ? `\n\n*PIX:*\n\`${d.codigoPix}\`` : '',
      d.urlBoleto ? `\n\n*Boleto:* ${d.urlBoleto}` : '',
    ].filter(Boolean).join('');
    const rodape = `\nDúvidas: ${d.telefoneEscola} — ${d.nomeEscola}`;

    if (tipo === 'lembrete') {
      return `📅 *Olá, ${d.nomeResponsavel}!*\n\nA mensalidade${comp} de *${d.nomeAluno}* vence em *${d.diasRestantes} dia(s)* (${d.vencimento}).\n\n*Valor:* ${d.valor}${pagamento}${rodape}`;
    }

    if (tipo === 'vencimento_hoje') {
      return `⏰ *Olá, ${d.nomeResponsavel}!*\n\nA mensalidade${comp} de *${d.nomeAluno}* vence *hoje* (${d.vencimento}).\n\n*Valor:* ${d.valor}${pagamento}\n\nRegularize hoje para evitar juros.${rodape}`;
    }

    return `⚠️ *Olá, ${d.nomeResponsavel}!*\n\nA mensalidade${comp} de *${d.nomeAluno}* está em aberto há *${d.diasAtraso} dia(s)* (venceu em ${d.vencimento}).\n\n*Valor:* ${d.valor}${pagamento}\n\nPor favor, regularize o quanto antes.${rodape}`;
  }

  @Cron('0 8 * * *', { name: 'wpp_job' })
  async runWhatsAppJob(): Promise<void> {
    if (this.config.get<string>('zapi.cronHabilitado') !== 'true') {
      this.logger.warn('Job de WhatsApp desabilitado (WPP_CRON_HABILITADO=false)');
      return;
    }

    this.logger.log('=== Iniciando job de WhatsApp ===');

    const diasAntes = this.config.get<number>('email.diasAntes') ?? 3;
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 3, 7];
    const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'Escola';
    const telefoneEscola = this.config.get<string>('email.telefoneEscola') ?? '';

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pendentes = await this.financeiro.getLancamentosPendentes();
    let totalEnviados = 0;
    let totalErros = 0;

    for (const { cliente, lancamento } of pendentes) {
      if (!cliente.telefoneResponsavel) continue;

      try {
        const venc = parseDateBR(lancamento.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

        let tipo: WppTipo | null = null;
        let tipoBase: TipoBase | null = null;

        if (diffDias === 0) {
          tipo = 'wpp_vencimento_hoje'; tipoBase = 'vencimento_hoje';
        } else if (diffDias > 0 && diffDias <= diasAntes) {
          tipo = 'wpp_lembrete'; tipoBase = 'lembrete';
        } else if (diffDias < 0 && diasAposVencimento.includes(Math.abs(diffDias))) {
          tipo = 'wpp_cobranca'; tipoBase = 'cobranca';
        }

        if (!tipo || !tipoBase) continue;

        const jaEnviado = await this.logRepo.findOne({
          where: { codigoLancamento: String(lancamento.id), tipo, enviado: true },
        });
        if (jaEnviado && new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString()) continue;

        const mensagem = this.montarMensagem(tipoBase, {
          nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
          nomeAluno: cliente.nomeAluno,
          valor: `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
          vencimento: venc.toLocaleDateString('pt-BR'),
          diasRestantes: diffDias > 0 ? diffDias : undefined,
          diasAtraso: diffDias < 0 ? Math.abs(diffDias) : undefined,
          competencia: lancamento.competencia ? this.formatarCompetencia(lancamento.competencia) : undefined,
          codigoPix: lancamento.codigoPix ?? undefined,
          urlBoleto: lancamento.urlBoleto ?? undefined,
          telefoneEscola,
          nomeEscola,
        });

        const log = this.logRepo.create({
          codigoLancamento: String(lancamento.id),
          tipo,
          destinatario: cliente.telefoneResponsavel,
          enviado: false,
        });

        try {
          await this.whatsapp.enviarTexto(cliente.telefoneResponsavel, mensagem);
          log.enviado = true;
          totalEnviados++;
        } catch (err: any) {
          log.erro = err.message;
          totalErros++;
          this.logger.error(`Erro WhatsApp ${cliente.telefoneResponsavel}: ${err.message}`);
        }

        await this.logRepo.save(log);
      } catch (err: any) {
        this.logger.error(`Erro ao processar lançamento ${lancamento.id}: ${err.message}`);
      }
    }

    this.logger.log(`=== Job WhatsApp concluído: ${totalEnviados} enviados, ${totalErros} erros ===`);
  }
}
