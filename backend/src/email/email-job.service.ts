import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { errMsg } from '../common/err.util';
import * as QRCode from 'qrcode';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { SophiaService } from '../sophia/sophia.service';
import { LancamentoAlunoApiModel } from '../sophia/types/sophia.types';
import { EmailService } from './email.service';
import { EmailLog, EmailTipo } from './entities/email-log.entity';
import { LancamentoCache } from '../financeiro/entities/lancamento-cache.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import {
  templateCobranca,
  templateLembrete,
  templateVencimentoHoje,
  type EmailData,
} from './templates/email.templates';
import { parseDateBR } from '../common/date.util';

const QR_CID = 'qrpix@email';

const EMAIL_ANTES_TIPO: Record<number, EmailTipo> = {
  7: 'lembrete_7', 5: 'lembrete_5', 3: 'lembrete_3', 1: 'lembrete_1',
};
const EMAIL_APOS_TIPO: Record<number, EmailTipo> = {
  1: 'cobranca_1',   2: 'cobranca_2',  3: 'cobranca_3',  7: 'cobranca_7',
  8: 'cobranca_8',   9: 'cobranca_9',  10: 'cobranca_10', 12: 'cobranca_12',
  15: 'cobranca_15', 20: 'cobranca_20', 25: 'cobranca_25', 30: 'cobranca_30',
};

async function gerarQrCode(texto: string): Promise<Buffer | undefined> {
  try {
    return await QRCode.toBuffer(texto, { width: 260, margin: 1, type: 'png' });
  } catch {
    return undefined;
  }
}

@Injectable()
export class EmailJobService {
  private readonly logger = new Logger(EmailJobService.name);
  private runtimeEnabled: boolean | null = null;

  get habilitado(): boolean {
    if (this.runtimeEnabled !== null) return this.runtimeEnabled;
    return this.config.get<string>('email.cronHabilitado') === 'true';
  }

  toggleHabilitado(ativo: boolean): void {
    this.runtimeEnabled = ativo;
    this.logger.log(`Job de emails ${ativo ? 'habilitado' : 'desabilitado'} via runtime`);
  }

  constructor(
    private readonly financeiro: FinanceiroService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly sophia: SophiaService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
    @InjectRepository(LancamentoCache)
    private readonly lancamentoRepo: Repository<LancamentoCache>,
    @InjectRepository(ClienteCache)
    private readonly clienteRepo: Repository<ClienteCache>,
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
      linkPortalAluno: this.config.get<string>('email.linkPortalAluno') || undefined,
      linkSegundaVia:  this.config.get<string>('email.linkPortalAluno') || undefined,
      linkComoAcessar: (() => {
        const base = this.config.get<string>('backendUrl');
        return base ? `${base}/como-pagar` : undefined;
      })(),
    };
  }

  @Cron('0 7,19 * * *', { name: 'email_job', timeZone: 'America/Sao_Paulo' })
  async runEmailJob(): Promise<void> {
    if (!this.habilitado) {
      this.logger.warn('Job de emails desabilitado (EMAIL_CRON_HABILITADO=false)');
      return;
    }
    this.logger.log('=== Iniciando job de emails ===');

    const diasAntes = this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1];
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30];
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const BATCH_LIMIT = 500;
    const pendentes = (await this.financeiro.getLancamentosPendentes()).slice(0, BATCH_LIMIT);
    const cacheAlunos = new Map<number, LancamentoAlunoApiModel[]>();
    let totalEnviados = 0;
    let totalErros = 0;
    let totalJaPagos = 0;

    for (const { cliente, lancamento } of pendentes) {
      if (!cliente.emailResponsavel) continue;
      try {
        const venc = parseDateBR(lancamento.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

        const tipo = this.calcularTipo(diffDias, diasAntes, diasAposVencimento);
        if (!tipo) continue;

        const jaEnviado = await this.emailLogRepo.findOne({
          where: { codigoLancamento: String(lancamento.id), tipo, enviado: true },
        });
        if (jaEnviado && new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString()) continue;

        if (!(await this.aindaPendenteNaSophia(cliente, lancamento, cacheAlunos))) {
          totalJaPagos++;
          continue;
        }

        const emailData: EmailData = {
          nomeAluno:       cliente.nomeAluno,
          nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
          descricao:       'Mensalidade',
          valor:           `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
          vencimento:      venc.toLocaleDateString('pt-BR'),
          diasRestantes:   diffDias > 0 ? diffDias : undefined,
          diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
          codigoBarras:    lancamento.linhaDigitavel ?? undefined,
          urlBoleto:       lancamento.urlBoleto ?? undefined,
          codigoPix:       lancamento.codigoPix ?? undefined,
          qrCodeUrl:       lancamento.codigoPix ? `cid:${QR_CID}` : undefined,
          codigoMatricula: cliente.ra ?? String(cliente.codigoSophia ?? cliente.id),
          competencia:     lancamento.competencia ? this.formatarCompetencia(lancamento.competencia) : undefined,
          ...escola,
        };

        const qrBuffer = lancamento.codigoPix ? await gerarQrCode(lancamento.codigoPix) : undefined;

        let template: { subject: string; html: string };
        if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
        else if (tipo.startsWith('lembrete')) template = templateLembrete(emailData);
        else template = templateCobranca(emailData);

        const log = this.emailLogRepo.create({
          codigoLancamento: String(lancamento.id),
          tipo,
          destinatario: cliente.emailResponsavel,
          enviado: false,
        });

        try {
          await this.emailService.enviar(
            cliente.emailResponsavel, template.subject, template.html,
            qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
          );
          log.enviado = true;
          totalEnviados++;
        } catch (err: unknown) {
          log.erro = errMsg(err);
          totalErros++;
          this.logger.error(`Erro ao enviar email para ${cliente.emailResponsavel}: ${errMsg(err)}`);
        }

        await this.emailLogRepo.save(log);
      } catch (err: unknown) {
        this.logger.error(`Erro ao processar lançamento ${lancamento.id}: ${errMsg(err)}`);
      }
    }

    this.logger.log(`=== Job de emails concluído: ${totalEnviados} enviados, ${totalErros} erros, ${totalJaPagos} já pagos (pulados) ===`);
  }

  /**
   * O cache local (lancamentos_cache) só é atualizado pelo sync de hora em
   * hora — se o aluno pagou depois do último ciclo, o "recebido" local ainda
   * está desatualizado. Antes de mandar o email, confere ao vivo na Sophia
   * se a parcela realmente continua em aberto, pra não cobrar quem já pagou.
   * `cacheAlunos` evita repetir a chamada pro mesmo aluno dentro do mesmo run.
   */
  private async aindaPendenteNaSophia(
    cliente: ClienteCache,
    lancamento: LancamentoCache,
    cacheAlunos: Map<number, LancamentoAlunoApiModel[]>,
  ): Promise<boolean> {
    if (!cliente.codigoSophia || !lancamento.codigoSophia) return true;

    try {
      let lancamentosAluno = cacheAlunos.get(cliente.codigoSophia);
      if (!lancamentosAluno) {
        lancamentosAluno = await this.sophia.getLancamentosAluno(cliente.codigoSophia);
        cacheAlunos.set(cliente.codigoSophia, lancamentosAluno);
      }

      const atual = lancamentosAluno.find((l) => l.codigo === lancamento.codigoSophia);
      if (!atual) return true; // não achou na Sophia — não bloqueia por segurança

      if (atual.recebido > 0) {
        await this.lancamentoRepo.update(lancamento.id, { recebido: true });
        this.logger.log(`Lançamento ${lancamento.id} já estava pago na Sophia — pulando email e corrigindo cache local`);
        return false;
      }
      return true;
    } catch (err: unknown) {
      this.logger.warn(`Falha ao conferir pagamento ao vivo do lançamento ${lancamento.id}: ${errMsg(err)}`);
      return true; // checagem falhou — não bloqueia o envio
    }
  }

  /** Mesma regra do job real: só considera dia 0 (vencimento hoje) ou um dos dias configurados em EMAIL_DIAS_ANTES/EMAIL_DIAS_APOS. */
  private calcularTipo(diffDias: number, diasAntes: number[], diasAposVencimento: number[]): EmailTipo | null {
    if (diffDias === 0) return 'vencimento_hoje';
    if (diffDias > 0 && diasAntes.includes(diffDias)) return EMAIL_ANTES_TIPO[diffDias] ?? 'lembrete';
    if (diffDias < 0 && diasAposVencimento.includes(Math.abs(diffDias))) return EMAIL_APOS_TIPO[Math.abs(diffDias)] ?? 'cobranca';
    return null;
  }

  /**
   * Escolhe, entre os lançamentos pendentes, o primeiro que REALMENTE dispararia
   * um email no job real (mesmos marcos de dia configurados) — pra que o preview
   * simule de verdade "como se fosse produção" em vez de pegar qualquer pendência
   * arbitrária (que pode vencer daqui a meses e nunca geraria email nenhum).
   */
  async previewComDadosSophia(destinatario: string): Promise<{ aluno: string; tipo: string; lancamento: number }> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diasAntes = this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1];
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30];

    const pendentes = await this.financeiro.getLancamentosPendentes();
    if (pendentes.length === 0) throw new Error('Nenhum lançamento em aberto encontrado no banco local');

    const cacheAlunos = new Map<number, LancamentoAlunoApiModel[]>();
    let encontrado: { cliente: (typeof pendentes)[number]['cliente']; lancamento: (typeof pendentes)[number]['lancamento']; diffDias: number; tipo: EmailTipo } | null = null;
    for (const { cliente, lancamento } of pendentes) {
      const venc = parseDateBR(lancamento.dataVencimento);
      venc.setHours(0, 0, 0, 0);
      const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);
      const tipo = this.calcularTipo(diffDias, diasAntes, diasAposVencimento);
      if (!tipo) continue;
      if (!(await this.aindaPendenteNaSophia(cliente, lancamento, cacheAlunos))) continue;
      encontrado = { cliente, lancamento, diffDias, tipo };
      break;
    }
    if (!encontrado) {
      throw new Error(
        'Nenhuma pendência hoje bate exatamente com os dias configurados (EMAIL_DIAS_ANTES/EMAIL_DIAS_APOS), ou as que bateriam já estão pagas na Sophia — ' +
        'nenhum email real seria disparado agora. Use /email/test/cpf ou /email/test/lancamento pra testar um aluno específico mesmo assim.',
      );
    }

    const { cliente, lancamento, diffDias, tipo } = encontrado;
    const venc = parseDateBR(lancamento.dataVencimento);
    venc.setHours(0, 0, 0, 0);

    const emailData: EmailData = {
      nomeAluno:       cliente.nomeAluno,
      nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
      descricao:       'Mensalidade',
      valor:           `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
      vencimento:      venc.toLocaleDateString('pt-BR'),
      diasRestantes:   diffDias > 0 ? diffDias : undefined,
      diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras:    lancamento.linhaDigitavel ?? undefined,
      urlBoleto:       lancamento.urlBoleto ?? undefined,
      codigoPix:       lancamento.codigoPix ?? undefined,
      qrCodeUrl:       lancamento.codigoPix ? `cid:${QR_CID}` : undefined,
      codigoMatricula: cliente.ra ?? String(cliente.codigoSophia ?? cliente.id),
      competencia:     lancamento.competencia ? this.formatarCompetencia(lancamento.competencia) : undefined,
      ...escola,
    };

    const qrBuffer = lancamento.codigoPix ? await gerarQrCode(lancamento.codigoPix) : undefined;

    let template: { subject: string; html: string };
    if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
    else if (tipo.startsWith('lembrete')) template = templateLembrete(emailData);
    else template = templateCobranca(emailData);

    await this.emailService.enviar(
      destinatario, `[PREVIEW] ${template.subject}`, template.html,
      qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
    );
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

    const venc = parseDateBR(pend.vencimento);
    venc.setHours(0, 0, 0, 0);
    const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

    let tipo: EmailTipo;
    if (diffDias === 0) tipo = 'vencimento_hoje';
    else if (diffDias < 0) tipo = 'cobranca';
    else tipo = 'lembrete';

    const emailData: EmailData = {
      nomeAluno:       dados.nomeAluno,
      nomeResponsavel: dados.nomeResponsavel,
      descricao:       'Mensalidade',
      valor:           `R$ ${pend.valor.toFixed(2).replace('.', ',')}`,
      vencimento:      venc.toLocaleDateString('pt-BR'),
      diasRestantes:   diffDias > 0 ? diffDias : undefined,
      diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras:    pend.linhaDigitavel,
      urlBoleto:       pend.urlBoleto,
      codigoPix:       pend.codigoPix,
      qrCodeUrl:       pend.codigoPix ? `cid:${QR_CID}` : undefined,
      codigoMatricula: dados.ra ?? String(pend.codigo),
      competencia:     pend.competencia ? this.formatarCompetencia(pend.competencia) : undefined,
      ...escola,
    };

    const qrBuffer = pend.codigoPix ? await gerarQrCode(pend.codigoPix) : undefined;

    let template: { subject: string; html: string };
    if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
    else if (tipo.startsWith('lembrete')) template = templateLembrete(emailData);
    else template = templateCobranca(emailData);

    await this.emailService.enviar(
      destinatario, `[PREVIEW] ${template.subject}`, template.html,
      qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
    );
    return { aluno: dados.nomeAluno, tipo, lancamento: pend.codigo };
  }

  async previewPorLancamento(codigoLancamento: number, destinatario: string): Promise<{ aluno: string; tipo: string; lancamento: number }> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const lancamento = await this.lancamentoRepo.findOne({ where: { id: codigoLancamento } });
    if (!lancamento) throw new NotFoundException(`Lançamento ${codigoLancamento} não encontrado`);

    const cliente = await this.clienteRepo.findOne({ where: { id: lancamento.codigoCliente } });
    if (!cliente) throw new NotFoundException(`Cliente do lançamento ${codigoLancamento} não encontrado`);

    if (!(await this.aindaPendenteNaSophia(cliente, lancamento, new Map()))) {
      throw new Error(`Lançamento ${codigoLancamento} já está pago na Sophia (cache local ainda não tinha sido atualizado pelo sync de hora em hora).`);
    }

    const venc = parseDateBR(lancamento.dataVencimento);
    venc.setHours(0, 0, 0, 0);
    const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

    let tipo: EmailTipo;
    if (diffDias === 0) tipo = 'vencimento_hoje';
    else if (diffDias < 0) tipo = 'cobranca';
    else tipo = 'lembrete';

    const emailData: EmailData = {
      nomeAluno:       cliente.nomeAluno,
      nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
      descricao:       'Mensalidade',
      valor:           `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
      vencimento:      venc.toLocaleDateString('pt-BR'),
      diasRestantes:   diffDias > 0 ? diffDias : undefined,
      diasAtraso:      diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras:    lancamento.linhaDigitavel ?? undefined,
      urlBoleto:       lancamento.urlBoleto ?? undefined,
      codigoPix:       lancamento.codigoPix ?? undefined,
      qrCodeUrl:       lancamento.codigoPix ? `cid:${QR_CID}` : undefined,
      codigoMatricula: cliente.ra ?? String(cliente.codigoSophia ?? cliente.id),
      competencia:     lancamento.competencia ? this.formatarCompetencia(lancamento.competencia) : undefined,
      ...escola,
    };

    const qrBuffer = lancamento.codigoPix ? await gerarQrCode(lancamento.codigoPix) : undefined;

    let template: { subject: string; html: string };
    if (tipo === 'vencimento_hoje') template = templateVencimentoHoje(emailData);
    else if (tipo.startsWith('lembrete')) template = templateLembrete(emailData);
    else template = templateCobranca(emailData);

    await this.emailService.enviar(
      destinatario, `[PREVIEW] ${template.subject}`, template.html,
      qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
    );
    return { aluno: cliente.nomeAluno, tipo, lancamento: lancamento.id };
  }
}
