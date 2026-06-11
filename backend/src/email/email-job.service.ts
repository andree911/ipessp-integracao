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

  // Roda todo dia às 08h
  @Cron('0 8 * * *', { name: 'email_job' })
  async runEmailJob(): Promise<void> {
    this.logger.log('=== Iniciando job de emails ===');

    const diasAntes = this.config.get<number>('email.diasAntes') ?? 3;
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 3, 7];
    const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'Escola';
    const emailEscola = this.config.get<string>('email.from') ?? '';
    const telefoneEscola = this.config.get<string>('email.telefoneEscola') ?? '';

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
            nomeEscola,
            emailEscola,
            telefoneEscola,
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
}
