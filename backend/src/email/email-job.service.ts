import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { EmailService } from './email.service';
import { EmailLog, EmailTipo } from './entities/email-log.entity';
import {
  templateCobranca,
  templateLembrete,
  templateVencimentoHoje,
  type EmailData,
} from './templates/email.templates';

@Injectable()
export class EmailJobService {
  private readonly logger = new Logger(EmailJobService.name);

  constructor(
    private readonly financeiro: FinanceiroService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
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

  private dadosEscola() {
    return {
      nomeEscola:     this.config.get<string>('email.nomeEscola') ?? 'Escola',
      emailEscola:    this.config.get<string>('email.from') ?? '',
      telefoneEscola: this.config.get<string>('email.telefoneEscola') ?? '',
      logoUrl:        this.config.get<string>('email.logoUrl') || undefined,
      siteUrl:        this.config.get<string>('email.siteUrl') || undefined,
      instagramUrl:   this.config.get<string>('email.instagramUrl') || undefined,
      facebookUrl:    this.config.get<string>('email.facebookUrl') || undefined,
      youtubeUrl:     this.config.get<string>('email.youtubeUrl') || undefined,
      linkedinUrl:    this.config.get<string>('email.linkedinUrl') || undefined,
      cnpj:           this.config.get<string>('email.cnpj') || undefined,
      endereco:       this.config.get<string>('email.endereco') || undefined,
    };
  }

  @Cron('0 8 * * *', { name: 'email_job' })
  async runEmailJob(): Promise<void> {
    if (this.config.get<string>('email.cronHabilitado') !== 'true') {
      this.logger.warn('Job de emails desabilitado (EMAIL_CRON_HABILITADO=false)');
      return;
    }
    this.logger.log('=== Iniciando job de emails ===');

    const diasAntes = this.config.get<number>('email.diasAntes') ?? 3;
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 3, 7];
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pendentes = await this.financeiro.getLancamentosPendentes();
    let totalEnviados = 0;
    let totalErros = 0;

    for (const { cliente, lancamento } of pendentes) {
      try {
        const venc = new Date(lancamento.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

        let tipo: EmailTipo | null = null;
        if (diffDias === 0) tipo = 'vencimento_hoje';
        else if (diffDias > 0 && diffDias <= diasAntes) tipo = 'lembrete';
        else if (diffDias < 0 && diasAposVencimento.includes(Math.abs(diffDias))) tipo = 'cobranca';

        if (!tipo) continue;

        const jaEnviado = await this.emailLogRepo.findOne({
          where: { codigoLancamento: String(lancamento.id), tipo, enviado: true },
        });
        if (jaEnviado && new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString()) continue;

        const emailData: EmailData = {
          nomeAluno:       cliente.nomeAluno,
          nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
          descricao:       lancamento.descricao ?? 'Mensalidade',
          valor:           `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
          vencimento:      venc.toLocaleDateString('pt-BR'),
          diasRestantes:   diffDias > 0 ? diffDias : undefined,
          diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
          codigoBarras:    lancamento.linhaDigitavel ?? undefined,
          urlBoleto:       lancamento.urlBoleto ?? undefined,
          codigoPix:       lancamento.codigoPix ?? undefined,
          codigoMatricula: String(cliente.codigoSophia ?? cliente.id),
          competencia:     lancamento.competencia ? this.formatarCompetencia(lancamento.competencia) : undefined,
          ...escola,
        };

        let template: { subject: string; html: string };
        if (tipo === 'lembrete') template = templateLembrete(emailData);
        else if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
        else template = templateCobranca(emailData);

        const log = this.emailLogRepo.create({
          codigoLancamento: String(lancamento.id),
          tipo,
          destinatario: cliente.emailResponsavel,
          enviado: false,
        });

        try {
          await this.emailService.enviar(cliente.emailResponsavel, template.subject, template.html);
          log.enviado = true;
          totalEnviados++;
        } catch (err: any) {
          log.erro = err.message;
          totalErros++;
          this.logger.error(`Erro ao enviar email para ${cliente.emailResponsavel}: ${err.message}`);
        }

        await this.emailLogRepo.save(log);
      } catch (err: any) {
        this.logger.error(`Erro ao processar lançamento ${lancamento.id}: ${err.message}`);
      }
    }

    this.logger.log(`=== Job de emails concluído: ${totalEnviados} enviados, ${totalErros} erros ===`);
  }

  async previewComDadosSophia(destinatario: string): Promise<{ aluno: string; tipo: string; lancamento: number }> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pendentes = await this.financeiro.getLancamentosPendentes();
    if (pendentes.length === 0) throw new Error('Nenhum lançamento em aberto encontrado no banco local');

    const { cliente, lancamento } = pendentes[0];
    const venc = new Date(lancamento.dataVencimento);
    venc.setHours(0, 0, 0, 0);
    const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

    let tipo: EmailTipo;
    if (diffDias === 0) tipo = 'vencimento_hoje';
    else if (diffDias < 0) tipo = 'cobranca';
    else tipo = 'lembrete';

    const emailData: EmailData = {
      nomeAluno:       cliente.nomeAluno,
      nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
      descricao:       lancamento.descricao ?? 'Mensalidade',
      valor:           `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
      vencimento:      venc.toLocaleDateString('pt-BR'),
      diasRestantes:   diffDias > 0 ? diffDias : undefined,
      diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras:    lancamento.linhaDigitavel ?? undefined,
      urlBoleto:       lancamento.urlBoleto ?? undefined,
      codigoPix:       lancamento.codigoPix ?? undefined,
      codigoMatricula: String(cliente.codigoSophia ?? cliente.id),
      competencia:     lancamento.competencia ? this.formatarCompetencia(lancamento.competencia) : undefined,
      ...escola,
    };

    let template: { subject: string; html: string };
    if (tipo === 'lembrete') template = templateLembrete(emailData);
    else if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
    else template = templateCobranca(emailData);

    await this.emailService.enviar(destinatario, `[PREVIEW] ${template.subject}`, template.html);
    return { aluno: cliente.nomeAluno, tipo, lancamento: lancamento.id };
  }

  async previewPorCpf(cpf: string, destinatario: string): Promise<{ aluno: string; tipo: string; lancamento: number }> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dados = await this.financeiro.getByCpf(cpf);
    if (dados.pendencias.length === 0) throw new Error(`${dados.nomeAluno} não possui lançamentos em aberto`);

    dados.pendencias.sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    const pend = dados.pendencias[0];

    const venc = new Date(pend.vencimento);
    venc.setHours(0, 0, 0, 0);
    const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

    let tipo: EmailTipo;
    if (diffDias === 0) tipo = 'vencimento_hoje';
    else if (diffDias < 0) tipo = 'cobranca';
    else tipo = 'lembrete';

    const emailData: EmailData = {
      nomeAluno:       dados.nomeAluno,
      nomeResponsavel: dados.nomeResponsavel,
      descricao:       pend.descricao,
      valor:           `R$ ${pend.valor.toFixed(2).replace('.', ',')}`,
      vencimento:      venc.toLocaleDateString('pt-BR'),
      diasRestantes:   diffDias > 0 ? diffDias : undefined,
      diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras:    pend.linhaDigitavel,
      urlBoleto:       pend.urlBoleto,
      codigoPix:       pend.codigoPix,
      codigoMatricula: String(pend.codigo),
      competencia:     pend.competencia ? this.formatarCompetencia(pend.competencia) : undefined,
      ...escola,
    };

    let template: { subject: string; html: string };
    if (tipo === 'lembrete') template = templateLembrete(emailData);
    else if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
    else template = templateCobranca(emailData);

    await this.emailService.enviar(destinatario, `[PREVIEW] ${template.subject}`, template.html);
    return { aluno: dados.nomeAluno, tipo, lancamento: pend.codigo };
  }
}
