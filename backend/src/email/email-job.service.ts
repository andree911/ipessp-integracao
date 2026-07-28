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
  templateAviso,
  templateRenegociacaoOferta,
  templateRenegociacaoLembrete,
  templateCancelamentoAcademico,
  templateCancelamentoFinanceiro,
  templateCancelamentoReembolso,
  type EmailData,
  type CancelamentoEmailData,
} from './templates/email.templates';
import { parseDateBR } from '../common/date.util';

const QR_CID = 'qrpix@email';

const EMAIL_ANTES_TIPO: Record<number, EmailTipo> = {
  7: 'lembrete_7', 5: 'lembrete_5', 3: 'lembrete_3', 1: 'lembrete_1',
};
const EMAIL_AVISO_TIPO: Record<number, EmailTipo> = {
  10: 'aviso_10', 9: 'aviso_9', 8: 'aviso_8', 7: 'aviso_7', 6: 'aviso_6',
  4: 'aviso_4',   3: 'aviso_3', 2: 'aviso_2', 1: 'aviso_1',
};
const EMAIL_APOS_TIPO: Record<number, EmailTipo> = {
  1: 'cobranca_1',   2: 'cobranca_2',  3: 'cobranca_3',  7: 'cobranca_7',
  8: 'cobranca_8',   9: 'cobranca_9',  10: 'cobranca_10', 12: 'cobranca_12',
  15: 'cobranca_15', 20: 'cobranca_20', 25: 'cobranca_25', 30: 'cobranca_30',
};

function templatePorTipo(tipo: EmailTipo, emailData: EmailData): { subject: string; html: string } {
  if (tipo === 'vencimento_hoje') return templateVencimentoHoje(emailData);
  if (tipo === 'renegociacao_oferta') return templateRenegociacaoOferta(emailData);
  if (tipo === 'renegociacao_lembrete') return templateRenegociacaoLembrete(emailData);
  if (tipo.startsWith('aviso')) return templateAviso(emailData);
  if (tipo.startsWith('lembrete')) return templateLembrete(emailData);
  return templateCobranca(emailData);
}

/** Sorteio 50/50 entre os dois modelos de renegociação — decisão de negócio: sem ordem fixa. */
function sortearTipoRenegociacao(): EmailTipo {
  return Math.random() < 0.5 ? 'renegociacao_oferta' : 'renegociacao_lembrete';
}

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
      assetsBaseUrl:  this.config.get<string>('email.assetsBaseUrl') || undefined,
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

  /**
   * Dispara o email de cancelamento pro RA informado. `tipo === 'academico'`
   * sempre manda a mesma confirmação simples (sem valores — isso é papel do
   * financeiro); `tipo === 'financeiro'` escolhe sozinho, a partir do resumo
   * atual, entre os 3 textos: sem multa/atraso, só multa, ou multa +
   * inadimplência (ver templateCancelamentoFinanceiro); `tipo === 'reembolso'`
   * manda o pedido de dados bancários (cenário à parte, só disponível na tela
   * quando não há multa/parcela/saldo devedor registrados).
   *
   * `overrides` vem da tela de Cancelamentos do ipessp-corporativo, onde o
   * financeiro edita manualmente saldo devedor/parcelas em atraso/etc — esses
   * valores prevalecem sobre o resumo recalculado aqui (que reflete só o
   * cache de cobranças da Sophia e pode divergir do que foi ajustado à mão).
   * Sem overrides (chamada antiga, sem o campo `dados`), o comportamento
   * continua sendo recalcular tudo a partir do resumo.
   */
  async enviarCancelamento(
    ra: string,
    tipo: 'academico' | 'financeiro' | 'reembolso',
    overrides?: Partial<Pick<CancelamentoEmailData,
      'numeroParcelasRestantes' | 'valorParcela' | 'somaValor' | 'valorMulta' | 'parcelasEmAtraso' | 'saldoDevedor'
    >>,
  ): Promise<{ enviado: boolean; para: string; subject: string }> {
    const resumo = await this.financeiro.getResumoCancelamento(ra);
    if (!resumo.emailResponsavel) {
      throw new Error(`Aluno '${resumo.nomeAluno}' não tem e-mail de responsável cadastrado`);
    }

    const escola = this.dadosEscola();
    const emailData: CancelamentoEmailData = {
      ...escola,
      nomeAluno: resumo.nomeAluno,
      numeroParcelasRestantes: overrides?.numeroParcelasRestantes ?? resumo.parcelasEmAberto,
      valorParcela: overrides?.valorParcela ?? resumo.valorParcela,
      somaValor: overrides?.somaValor ?? resumo.somaValor,
      valorMulta: overrides?.valorMulta ?? resumo.valorMulta,
      parcelasEmAtraso: overrides?.parcelasEmAtraso ?? resumo.parcelasEmAtraso,
      saldoDevedor: overrides?.saldoDevedor ?? resumo.saldoDevedor,
    };

    const template = tipo === 'academico'
      ? templateCancelamentoAcademico(emailData)
      : tipo === 'reembolso'
        ? templateCancelamentoReembolso(emailData)
        : templateCancelamentoFinanceiro(emailData);
    const tipoLog: EmailTipo = tipo === 'academico'
      ? 'cancelamento_academico'
      : tipo === 'reembolso'
        ? 'cancelamento_reembolso'
        : 'cancelamento_financeiro';

    // Remetente próprio (EMAIL_CANCELAMENTO_FROM) — financeiro, pedagógico e
    // trancamento recebem cópia em CC (vars opcionais; endereços vazios
    // ignorados). Reembolso é assunto do financeiro (dados bancários): fica em
    // cópia o financeiro, o pedagógico, a própria caixa de cancelamento e a
    // matricula.financeiro (ESCOLA_EMAIL_NOTIFICACOES, endereço fixo — não dá
    // pra assumir que SMTP_FROM seja esse endereço) — só trancamento fica de
    // fora (não se aplica a reembolso).
    const cancelamentoFrom = this.config.get<string>('email.cancelamentoFrom');
    const ccEnderecos = [
      ...new Set(
        (tipo === 'reembolso'
          ? [
              this.config.get<string>('email.emailNotificacoes'),
              cancelamentoFrom,
              this.config.get<string>('email.cancelamentoCcPedagogico'),
              this.config.get<string>('email.cancelamentoCcFinanceiro'),
            ]
          : [
              this.config.get<string>('email.from'),
              this.config.get<string>('email.cancelamentoCcPedagogico'),
              this.config.get<string>('email.cancelamentoCcTrancamento'),
            ]
        ).filter(Boolean),
      ),
    ].join(', ');
    try {
      await this.emailService.enviar(
        resumo.emailResponsavel,
        template.subject,
        template.html,
        undefined,
        { from: cancelamentoFrom || undefined, cc: ccEnderecos || undefined },
      );
      await this.emailLogRepo.save({
        codigoLancamento: '',
        nome: resumo.nomeAluno,
        tipo: tipoLog,
        destinatario: resumo.emailResponsavel,
        enviado: true,
      });
    } catch (err: unknown) {
      await this.emailLogRepo.save({
        codigoLancamento: '',
        nome: resumo.nomeAluno,
        tipo: tipoLog,
        destinatario: resumo.emailResponsavel,
        enviado: false,
        erro: errMsg(err),
      });
      throw err;
    }
    return { enviado: true, para: resumo.emailResponsavel, subject: template.subject };
  }

  /** Histórico de e-mails enviados (cobrança, leads, cancelamento) — exclui WhatsApp, que usa a mesma tabela. */
  async listarHistoricoEmail(page = 1, limit = 50): Promise<{ items: EmailLog[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.emailLogRepo
      .createQueryBuilder('log')
      .where("log.tipo NOT LIKE 'wpp\\_%'")
      .orderBy('log.enviadoEm', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total, page, limit };
  }

  @Cron('0 7,19 * * *', { name: 'email_job', timeZone: 'America/Sao_Paulo' })
  async runEmailJobCron(): Promise<void> {
    return this.runEmailJob('cron');
  }

  /**
   * `origem: 'cron'` (as duas rodadas automáticas, 7h e 19h) nunca pula por
   * duplicidade — quem continua pendente recebe nas duas. `origem: 'manual'`
   * (POST /email/trigger) só reenvia se ainda não tiver mandado esse mesmo
   * tipo pra esse lançamento hoje, pra não duplicar se alguém disparar sem
   * querer entre as rodadas do cron.
   */
  async runEmailJob(origem: 'cron' | 'manual' = 'cron'): Promise<void> {
    if (!this.habilitado) {
      this.logger.warn('Job de emails desabilitado (EMAIL_CRON_HABILITADO=false)');
      return;
    }
    this.logger.log('=== Iniciando job de emails ===');

    const diasAntes = this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1];
    const diasAviso = this.config.get<number[]>('email.diasAviso') ?? [10, 9, 8, 7, 6, 4, 3, 2, 1];
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30];
    const diasRenegociacaoOverlap = this.config.get<number[]>('email.diasRenegociacaoOverlap') ?? [1, 3, 7];
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const BATCH_LIMIT = 500;
    const pendentes = (await this.financeiro.getLancamentosPendentes()).slice(0, BATCH_LIMIT);
    const cacheAlunos = new Map<number, LancamentoAlunoApiModel[]>();
    let totalEnviados = 0;
    let totalErros = 0;
    let totalJaPagos = 0;
    let totalSemBoleto = 0;

    for (const { cliente, lancamento } of pendentes) {
      if (!cliente.emailResponsavel) continue;
      try {
        const venc = parseDateBR(lancamento.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

        const tipos = this.calcularTipos(diffDias, diasAntes, diasAviso, diasAposVencimento, diasRenegociacaoOverlap);
        if (tipos.length === 0) continue;

        // Só cobra quem já tem boleto gerado e sincronizado no cache — sem
        // linhaDigitavel o email sairia "vazio" (sem código de barras nem
        // PIX pra pagar), o que confunde mais do que ajuda.
        if (!lancamento.linhaDigitavel) {
          totalSemBoleto++;
          continue;
        }

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

        for (const tipo of tipos) {
          if (origem === 'manual') {
            const jaEnviado = await this.emailLogRepo.findOne({
              where: { codigoLancamento: String(lancamento.id), tipo, enviado: true },
            });
            if (jaEnviado && new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString()) continue;
          }

          const template = templatePorTipo(tipo, emailData);

          const log = this.emailLogRepo.create({
            codigoLancamento: String(lancamento.id),
            nome: cliente.nomeAluno,
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
        }
      } catch (err: unknown) {
        this.logger.error(`Erro ao processar lançamento ${lancamento.id}: ${errMsg(err)}`);
      }
    }

    this.logger.log(`=== Job de emails concluído: ${totalEnviados} enviados, ${totalErros} erros, ${totalJaPagos} já pagos (pulados), ${totalSemBoleto} sem boleto (pulados) ===`);
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

  /**
   * Mesma regra do job real: só considera dia 0 (vencimento hoje) ou um dos
   * dias configurados em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS/
   * EMAIL_DIAS_RENEGOCIACAO_OVERLAP. Antes do vencimento pode retornar DOIS
   * tipos no mesmo dia (lembrete + aviso), já que os dias de EMAIL_DIAS_AVISO
   * propositalmente se sobrepõem aos de EMAIL_DIAS_ANTES em alguns dias (ex.:
   * 7, 3, 1). Depois do vencimento, a renegociação dispara em todo dia que o
   * cobranca NÃO cobre (sem teto — inclusive depois do dia 30, já que ali o
   * cobranca nunca cobre nada) mais os dias de sobreposição configurados em
   * EMAIL_DIAS_RENEGOCIACAO_OVERLAP — nesses dias de sobreposição, cobranca e
   * renegociação disparam juntos. Qual dos dois modelos de renegociação
   * (oferta detalhada ou lembrete direto) sai é sorteado 50/50 a cada disparo.
   */
  private calcularTipos(
    diffDias: number,
    diasAntes: number[],
    diasAviso: number[],
    diasAposVencimento: number[],
    diasRenegociacaoOverlap: number[],
  ): EmailTipo[] {
    if (diffDias === 0) return ['vencimento_hoje'];
    if (diffDias > 0) {
      const tipos: EmailTipo[] = [];
      if (diasAntes.includes(diffDias)) tipos.push(EMAIL_ANTES_TIPO[diffDias] ?? 'lembrete');
      if (diasAviso.includes(diffDias)) tipos.push(EMAIL_AVISO_TIPO[diffDias] ?? 'aviso');
      return tipos;
    }

    const diasAtraso = Math.abs(diffDias);
    const tipos: EmailTipo[] = [];
    if (diasAposVencimento.includes(diasAtraso)) tipos.push(EMAIL_APOS_TIPO[diasAtraso] ?? 'cobranca');
    if (diasRenegociacaoOverlap.includes(diasAtraso) || !diasAposVencimento.includes(diasAtraso)) {
      tipos.push(sortearTipoRenegociacao());
    }
    return tipos;
  }

  /**
   * Manda, pro destinatário de teste, uma cópia do email de TODA pendência
   * que REALMENTE dispararia um email hoje no job real (mesmos marcos de dia
   * configurados) — pra simular "como se fosse produção" de verdade, incluindo
   * o volume de emails que sairiam, não só um exemplo isolado.
   *
   * `diasSimulados` (opcional) restringe a busca a um único marco específico
   * — mesma convenção do diffDias interno (positivo = dias antes de vencer,
   * negativo = dias em atraso, 0 = vence hoje) — em vez de considerar TODOS
   * os marcos configurados. Os dados continuam 100% reais (vencimento e
   * valor de cada aluno não são forjados); só filtra quem está exatamente
   * naquele dia hoje. Dá erro se o dia pedido não estiver configurado em
   * EMAIL_DIAS_ANTES/EMAIL_DIAS_APOS (nunca geraria email nenhum) — mesmo
   * sem isso, se ninguém estiver exatamente nesse dia hoje, também dá erro.
   */
  async previewComDadosSophia(destinatario: string, diasSimulados?: number): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const diasAntes = this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1];
    const diasAviso = this.config.get<number[]>('email.diasAviso') ?? [10, 9, 8, 7, 6, 4, 3, 2, 1];
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30];
    const diasRenegociacaoOverlap = this.config.get<number[]>('email.diasRenegociacaoOverlap') ?? [1, 3, 7];

    if (diasSimulados !== undefined && this.calcularTipos(diasSimulados, diasAntes, diasAviso, diasAposVencimento, diasRenegociacaoOverlap).length === 0) {
      throw new Error(`O dia simulado (${diasSimulados}) não está em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS, e (se for atraso) já está coberto só pelo cobranca — nenhum email real seria disparado nesse marco.`);
    }

    const pendentes = await this.financeiro.getLancamentosPendentes();
    if (pendentes.length === 0) throw new Error('Nenhum lançamento em aberto encontrado no banco local');

    const cacheAlunos = new Map<number, LancamentoAlunoApiModel[]>();
    const resultados: { aluno: string; tipo: string; lancamento: number }[] = [];

    for (const { cliente, lancamento } of pendentes) {
      const venc = parseDateBR(lancamento.dataVencimento);
      venc.setHours(0, 0, 0, 0);
      const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);
      if (diasSimulados !== undefined && diffDias !== diasSimulados) continue;
      const tipos = this.calcularTipos(diffDias, diasAntes, diasAviso, diasAposVencimento, diasRenegociacaoOverlap);
      if (tipos.length === 0) continue;
      if (!(await this.aindaPendenteNaSophia(cliente, lancamento, cacheAlunos))) continue;

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

      for (const tipo of tipos) {
        const template = templatePorTipo(tipo, emailData);

        await this.emailService.enviar(
          destinatario, `[PREVIEW] ${template.subject} — ${cliente.nomeAluno}`, template.html,
          qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
        );

        resultados.push({ aluno: cliente.nomeAluno, tipo, lancamento: lancamento.id });
      }
    }

    if (resultados.length === 0) {
      const motivo = diasSimulados !== undefined
        ? `Nenhuma pendência está exatamente ${diasSimulados} dia(s) em relação ao vencimento hoje (ou as que estão já foram pagas na Sophia).`
        : 'Nenhuma pendência hoje bate exatamente com os dias configurados (EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS), ou as que bateriam já estão pagas na Sophia.';
      throw new Error(
        motivo +
        ' Nenhum email real seria disparado agora. Use /email/test/cpf ou /email/test/lancamento pra testar um aluno específico mesmo assim.',
      );
    }
    return resultados;
  }

  /**
   * `diasSimulados` (opcional) força o cenário de dia a testar, no lugar do
   * diffDias real do lançamento mais próximo — mesma convenção do diffDias
   * interno: positivo = dias antes de vencer, negativo = dias em atraso, 0 =
   * vence hoje. Útil pra testar um marco específico (ex.: -1 = "1 dia após o
   * vencimento") sem depender de existir um lançamento real batendo com ele
   * hoje. Se o dia simulado não estiver em EMAIL_DIAS_ANTES/EMAIL_DIAS_APOS,
   * dá erro (mesma regra do job real — não geraria email nenhum).
   */
  async previewPorCpf(cpf: string, destinatario: string, diasSimulados?: number): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const dados = await this.financeiro.getByCpf(cpf);
    if (dados.pendencias.length === 0) throw new Error(`${dados.nomeAluno} não possui lançamentos em aberto`);

    dados.pendencias.sort((a, b) => a.vencimento.localeCompare(b.vencimento));
    const pend = dados.pendencias[0];

    const diasAntes = this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1];
    const diasAviso = this.config.get<number[]>('email.diasAviso') ?? [10, 9, 8, 7, 6, 4, 3, 2, 1];
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30];
    const diasRenegociacaoOverlap = this.config.get<number[]>('email.diasRenegociacaoOverlap') ?? [1, 3, 7];

    let venc: Date;
    let diffDias: number;
    if (diasSimulados !== undefined) {
      diffDias = diasSimulados;
      venc = new Date(hoje.getTime() + diasSimulados * 86_400_000);
    } else {
      venc = parseDateBR(pend.vencimento);
      venc.setHours(0, 0, 0, 0);
      diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);
    }

    let tipos = this.calcularTipos(diffDias, diasAntes, diasAviso, diasAposVencimento, diasRenegociacaoOverlap);
    if (diasSimulados !== undefined && tipos.length === 0) {
      throw new Error(`O dia simulado (${diasSimulados}) não está em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS, e (se for atraso) já está coberto só pelo cobranca — nenhum email real seria disparado nesse marco.`);
    }
    if (tipos.length === 0) {
      tipos = [diffDias === 0 ? 'vencimento_hoje' : diffDias < 0 ? 'cobranca' : 'lembrete'];
    }

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
    const resultados: { aluno: string; tipo: string; lancamento: number }[] = [];

    for (const tipo of tipos) {
      const template = templatePorTipo(tipo, emailData);
      await this.emailService.enviar(
        destinatario, `[PREVIEW] ${template.subject}`, template.html,
        qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
      );
      resultados.push({ aluno: dados.nomeAluno, tipo, lancamento: pend.codigo });
    }
    return resultados;
  }

  /** `diasSimulados` — ver comentário de previewPorCpf, mesma convenção e comportamento. */
  async previewPorLancamento(codigoLancamento: number, destinatario: string, diasSimulados?: number): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
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

    const diasAntes = this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1];
    const diasAviso = this.config.get<number[]>('email.diasAviso') ?? [10, 9, 8, 7, 6, 4, 3, 2, 1];
    const diasAposVencimento = this.config.get<number[]>('email.diasAposVencimento') ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30];
    const diasRenegociacaoOverlap = this.config.get<number[]>('email.diasRenegociacaoOverlap') ?? [1, 3, 7];

    let venc: Date;
    let diffDias: number;
    if (diasSimulados !== undefined) {
      diffDias = diasSimulados;
      venc = new Date(hoje.getTime() + diasSimulados * 86_400_000);
    } else {
      venc = parseDateBR(lancamento.dataVencimento);
      venc.setHours(0, 0, 0, 0);
      diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);
    }

    let tipos = this.calcularTipos(diffDias, diasAntes, diasAviso, diasAposVencimento, diasRenegociacaoOverlap);
    if (diasSimulados !== undefined && tipos.length === 0) {
      throw new Error(`O dia simulado (${diasSimulados}) não está em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS, e (se for atraso) já está coberto só pelo cobranca — nenhum email real seria disparado nesse marco.`);
    }
    if (tipos.length === 0) {
      tipos = [diffDias === 0 ? 'vencimento_hoje' : diffDias < 0 ? 'cobranca' : 'lembrete'];
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
    const resultados: { aluno: string; tipo: string; lancamento: number }[] = [];

    for (const tipo of tipos) {
      const template = templatePorTipo(tipo, emailData);
      await this.emailService.enviar(
        destinatario, `[PREVIEW] ${template.subject}`, template.html,
        qrBuffer ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }] : undefined,
      );
      resultados.push({ aluno: cliente.nomeAluno, tipo, lancamento: lancamento.id });
    }
    return resultados;
  }
}
