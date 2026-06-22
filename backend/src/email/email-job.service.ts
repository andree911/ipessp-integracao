import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { EmailService } from './email.service';
import { EmailLog, EmailTipo } from './entities/email-log.entity';
import {
  templateCobranca,
  templateLembrete,
  templateVencimentoHoje,
} from './templates/email.templates';

@Injectable()
export class EmailJobService {
  private readonly logger = new Logger(EmailJobService.name);

  constructor(
    private readonly sophia: SophiaService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
  ) {}

  private formatarCompetencia(competencia: string): string {
    const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    // Aceita "2026-06", "06/2026" ou "06-2026"
    const match = competencia.match(/(\d{4})[-/](\d{2})|(\d{2})[-/](\d{4})/);
    if (!match) return competencia;
    const ano = match[1] ?? match[4];
    const mes = match[2] ?? match[3];
    const idx = parseInt(mes, 10) - 1;
    return idx >= 0 && idx < 12 ? `${meses[idx]}/${ano}` : competencia;
  }

  // Roda todo dia às 08h — controlado pela flag EMAIL_CRON_HABILITADO
  @Cron('0 8 * * *', { name: 'email_job' })
  async runEmailJob(): Promise<void> {
    if (this.config.get<string>('email.cronHabilitado') !== 'true') {
      this.logger.warn('Job de emails desabilitado (EMAIL_CRON_HABILITADO=false)');
      return;
    }
    this.logger.log('=== Iniciando job de emails ===');

    const diasAntes = this.config.get<number>('email.diasAntes') ?? 3;
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 3, 7];
    const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'Escola';
    const emailEscola = this.config.get<string>('email.from') ?? '';
    const telefoneEscola = this.config.get<string>('email.telefoneEscola') ?? '';
    const siteUrl = this.config.get<string>('email.siteUrl') || undefined;
    const instagramUrl = this.config.get<string>('email.instagramUrl') || undefined;
    const facebookUrl = this.config.get<string>('email.facebookUrl') || undefined;
    const youtubeUrl = this.config.get<string>('email.youtubeUrl') || undefined;
    const linkedinUrl = this.config.get<string>('email.linkedinUrl') || undefined;
    const cnpj = this.config.get<string>('email.cnpj') || undefined;
    const endereco = this.config.get<string>('email.endereco') || undefined;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const alunos = await this.sophia.getAllAlunos();
    let totalEnviados = 0;
    let totalErros = 0;

    for (const aluno of alunos) {
      try {
        const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
        const resp = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
        if (!resp?.email) continue;

        const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo);

        for (const lanc of lancamentos) {
          if (lanc.recebido !== 0) continue; // só lançamentos em aberto

          const venc = new Date(lanc.dataVencimento);
          venc.setHours(0, 0, 0, 0);
          const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

          let tipo: EmailTipo | null = null;
          if (diffDias === 0) tipo = 'vencimento_hoje';
          else if (diffDias > 0 && diffDias <= diasAntes) tipo = 'lembrete';
          else if (diffDias < 0 && diasAposVencimento.includes(Math.abs(diffDias))) tipo = 'cobranca';

          if (!tipo) continue;

          // Evita reenvio no mesmo dia para o mesmo tipo
          const jaEnviado = await this.emailLogRepo.findOne({
            where: { codigoLancamento: String(lanc.codigo), tipo, enviado: true },
          });
          if (jaEnviado) {
            const enviadoHoje = new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString();
            if (enviadoHoje) continue;
          }

          const emailData = {
            nomeAluno: aluno.nome,
            nomeResponsavel: resp.nome,
            descricao: lanc.descricao ?? 'Mensalidade',
            valor: `R$ ${lanc.valorPrevisto.toFixed(2).replace('.', ',')}`,
            vencimento: venc.toLocaleDateString('pt-BR'),
            diasRestantes: diffDias > 0 ? diffDias : undefined,
            diasAtraso: diffDias < 0 ? Math.abs(diffDias) : undefined,
            codigoBarras: lanc.linhaDigitavel,
            urlBoleto: lanc.urlBoletoDigital,
            codigoPix: lanc.codigoPix,
            codigoMatricula: aluno.codigo ? String(aluno.codigo) : undefined,
            competencia: lanc.competencia ? this.formatarCompetencia(lanc.competencia) : undefined,
            nomeEscola,
            emailEscola,
            telefoneEscola,
            logoUrl: this.config.get<string>('email.logoUrl') || undefined,
            siteUrl,
            instagramUrl,
            facebookUrl,
            youtubeUrl,
            linkedinUrl,
            cnpj,
            endereco,
          };

          let template: { subject: string; html: string };
          if (tipo === 'lembrete') template = templateLembrete(emailData);
          else if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
          else template = templateCobranca(emailData);

          const log = this.emailLogRepo.create({
            codigoLancamento: String(lanc.codigo),
            tipo,
            destinatario: resp.email,
            enviado: false,
          });

          try {
            await this.emailService.enviar(resp.email, template.subject, template.html);
            log.enviado = true;
            totalEnviados++;
          } catch (err: any) {
            log.erro = err.message;
            totalErros++;
            this.logger.error(`Erro ao enviar email para ${resp.email}: ${err.message}`);
          }

          await this.emailLogRepo.save(log);
        }
      } catch (err: any) {
        this.logger.error(`Erro ao processar aluno ${aluno.codigo}: ${err.message}`);
      }
    }

    this.logger.log(
      `=== Job de emails concluído: ${totalEnviados} enviados, ${totalErros} erros ===`,
    );
  }

  async previewComDadosSophia(destinatario: string): Promise<{ aluno: string; tipo: string; lancamento: number }> {
    const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'Escola';
    const emailEscola = this.config.get<string>('email.from') ?? '';
    const telefoneEscola = this.config.get<string>('email.telefoneEscola') ?? '';
    const siteUrl = this.config.get<string>('email.siteUrl') || undefined;
    const instagramUrl = this.config.get<string>('email.instagramUrl') || undefined;
    const facebookUrl = this.config.get<string>('email.facebookUrl') || undefined;
    const youtubeUrl = this.config.get<string>('email.youtubeUrl') || undefined;
    const linkedinUrl = this.config.get<string>('email.linkedinUrl') || undefined;
    const cnpj = this.config.get<string>('email.cnpj') || undefined;
    const endereco = this.config.get<string>('email.endereco') || undefined;
    const diasAntes = this.config.get<number>('email.diasAntes') ?? 3;
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 3, 7];

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const alunos = await this.sophia.getAllAlunos();

    for (const aluno of alunos) {
      const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
      const resp = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
      if (!resp) continue;

      const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo);
      const lanc = lancamentos.find((l) => l.recebido === 0);
      if (!lanc) continue;

      const venc = new Date(lanc.dataVencimento);
      venc.setHours(0, 0, 0, 0);
      const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

      let tipo: EmailTipo;
      if (diffDias === 0) tipo = 'vencimento_hoje';
      else if (diffDias < 0) tipo = 'cobranca';
      else tipo = 'lembrete';

      const emailData = {
        nomeAluno: aluno.nome,
        nomeResponsavel: resp.nome,
        descricao: lanc.descricao ?? 'Mensalidade',
        valor: `R$ ${lanc.valorPrevisto.toFixed(2).replace('.', ',')}`,
        vencimento: venc.toLocaleDateString('pt-BR'),
        diasRestantes: diffDias > 0 ? diffDias : undefined,
        diasAtraso: diffDias < 0 ? Math.abs(diffDias) : undefined,
        codigoBarras: lanc.linhaDigitavel,
        urlBoleto: lanc.urlBoletoDigital,
        codigoPix: lanc.codigoPix,
        codigoMatricula: aluno.codigo ? String(aluno.codigo) : undefined,
        competencia: lanc.competencia ? this.formatarCompetencia(lanc.competencia) : undefined,
        nomeEscola, emailEscola, telefoneEscola,
        logoUrl: this.config.get<string>('email.logoUrl') || undefined,
        siteUrl, instagramUrl, facebookUrl, youtubeUrl, linkedinUrl, cnpj, endereco,
      };

      let template: { subject: string; html: string };
      if (tipo === 'lembrete') template = templateLembrete(emailData);
      else if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
      else template = templateCobranca(emailData);

      await this.emailService.enviar(destinatario, `[PREVIEW] ${template.subject}`, template.html);
      return { aluno: aluno.nome, tipo, lancamento: lanc.codigo };
    }

    throw new Error('Nenhum aluno com lançamento em aberto encontrado no SophiA');
  }
}
