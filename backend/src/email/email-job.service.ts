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
import { mesmoDiaBR, parseDateBR } from '../common/date.util';
import { encontrarSubstitutosPagos } from '../common/lancamento-substituto.util';

const QR_CID = 'qrpix@email';

// Batch de chamadas concorrentes à Sophia por rodada -- mesmo valor do
// SyncService (SYNC_BATCH_SIZE), pra não abrir uma leva muito maior de
// conexões simultâneas do que o resto do sistema já costuma abrir.
const SOPHIA_BATCH_SIZE = 5;

const EMAIL_ANTES_TIPO: Record<number, EmailTipo> = {
  7: 'lembrete_7',
  5: 'lembrete_5',
  3: 'lembrete_3',
  1: 'lembrete_1',
};
const EMAIL_AVISO_TIPO: Record<number, EmailTipo> = {
  10: 'aviso_10',
  9: 'aviso_9',
  8: 'aviso_8',
  7: 'aviso_7',
  6: 'aviso_6',
  4: 'aviso_4',
  3: 'aviso_3',
  2: 'aviso_2',
  1: 'aviso_1',
};
const EMAIL_APOS_TIPO: Record<number, EmailTipo> = {
  1: 'cobranca_1',
  2: 'cobranca_2',
  3: 'cobranca_3',
  7: 'cobranca_7',
  8: 'cobranca_8',
  9: 'cobranca_9',
  10: 'cobranca_10',
  12: 'cobranca_12',
  15: 'cobranca_15',
  20: 'cobranca_20',
  25: 'cobranca_25',
  30: 'cobranca_30',
};

function templatePorTipo(
  tipo: EmailTipo,
  emailData: EmailData,
): { subject: string; html: string } {
  if (tipo === 'vencimento_hoje') return templateVencimentoHoje(emailData);
  if (tipo === 'renegociacao_oferta')
    return templateRenegociacaoOferta(emailData);
  if (tipo === 'renegociacao_lembrete')
    return templateRenegociacaoLembrete(emailData);
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

interface MarcosConfig {
  diasAntes: number[];
  diasAviso: number[];
  diasAposVencimento: number[];
  diasRenegociacaoOverlap: number[];
}

/**
 * Um envio já decidido (bateu marco de dia, tem boleto/PIX) -- separado em
 * duas fases porque a consulta à Sophia pode rodar em lote/concorrente sem
 * problema, mas o ENVIO de e-mail não pode: o Office 365 (SMTP) tem limite
 * de conexões concorrentes por conta, e mandar vários e-mails ao mesmo tempo
 * (um por aluno do lote) já bateu esse limite em teste real
 * (`432 4.3.2 Concurrent connections limit exceeded`). O job antigo nunca
 * batia nisso porque enviava tudo num loop sequencial simples.
 */
interface EnvioPendente {
  cliente: ClienteCache;
  lanc: LancamentoAlunoApiModel;
  diffDias: number;
  venc: Date;
  tipos: EmailTipo[];
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
    this.logger.log(
      `Job de emails ${ativo ? 'habilitado' : 'desabilitado'} via runtime`,
    );
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
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    const match = competencia.match(/(\d{4})[-/](\d{2})|(\d{2})[-/](\d{4})/);
    if (!match) return competencia;
    const ano = match[1] ?? match[4];
    const mes = match[2] ?? match[3];
    const idx = parseInt(mes, 10) - 1;
    return idx >= 0 && idx < 12 ? `${meses[idx]}/${ano}` : competencia;
  }

  private dadosEscola() {
    return {
      nomeEscola: this.config.get<string>('email.nomeEscola') ?? 'Escola',
      emailEscola: this.config.get<string>('email.from') ?? '',
      telefoneEscola: this.config.get<string>('email.telefoneEscola') ?? '',
      logoUrl: this.config.get<string>('email.logoUrl') || undefined,
      siteUrl: this.config.get<string>('email.siteUrl') || undefined,
      assetsBaseUrl:
        this.config.get<string>('email.assetsBaseUrl') || undefined,
      instagramUrl: this.config.get<string>('email.instagramUrl') || undefined,
      facebookUrl: this.config.get<string>('email.facebookUrl') || undefined,
      youtubeUrl: this.config.get<string>('email.youtubeUrl') || undefined,
      linkedinUrl: this.config.get<string>('email.linkedinUrl') || undefined,
      cnpj: this.config.get<string>('email.cnpj') || undefined,
      endereco: this.config.get<string>('email.endereco') || undefined,
      linkPortalAluno:
        this.config.get<string>('email.linkPortalAluno') || undefined,
      linkSegundaVia:
        this.config.get<string>('email.linkPortalAluno') || undefined,
      linkComoAcessar: (() => {
        const base = this.config.get<string>('backendUrl');
        return base ? `${base}/como-pagar` : undefined;
      })(),
    };
  }

  private carregarMarcos(): MarcosConfig {
    return {
      diasAntes: this.config.get<number[]>('email.diasAntes') ?? [7, 5, 3, 1],
      diasAviso: this.config.get<number[]>('email.diasAviso') ?? [
        10, 9, 8, 7, 6, 4, 3, 2, 1,
      ],
      diasAposVencimento: this.config.get<number[]>(
        'email.diasAposVencimento',
      ) ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20, 25, 30],
      diasRenegociacaoOverlap: this.config.get<number[]>(
        'email.diasRenegociacaoOverlap',
      ) ?? [1, 3, 7],
    };
  }

  /** Monta o EmailData a partir do lançamento AO VIVO da Sophia (não do cache) -- ver runEmailJob. */
  private buildEmailDataLive(
    cliente: ClienteCache,
    lanc: LancamentoAlunoApiModel,
    diffDias: number,
    venc: Date,
    escola: ReturnType<typeof this.dadosEscola>,
  ): EmailData {
    return {
      nomeAluno: cliente.nomeAluno,
      nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
      descricao: 'Mensalidade',
      valor: `R$ ${Number(lanc.valorPrevisto).toFixed(2).replace('.', ',')}`,
      vencimento: venc.toLocaleDateString('pt-BR'),
      diasRestantes: diffDias > 0 ? diffDias : undefined,
      diasAtraso: diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras: lanc.linhaDigitavel ?? undefined,
      urlBoleto: lanc.urlBoletoDigital ?? undefined,
      codigoPix: lanc.codigoPix ?? undefined,
      qrCodeUrl: lanc.codigoPix ? `cid:${QR_CID}` : undefined,
      codigoMatricula: cliente.ra ?? String(cliente.codigoSophia ?? cliente.id),
      competencia: lanc.competencia
        ? this.formatarCompetencia(lanc.competencia)
        : undefined,
      ...escola,
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
    overrides?: Partial<
      Pick<
        CancelamentoEmailData,
        | 'numeroParcelasRestantes'
        | 'valorParcela'
        | 'somaValor'
        | 'valorMulta'
        | 'parcelasEmAtraso'
        | 'saldoDevedor'
      >
    >,
  ): Promise<{ enviado: boolean; para: string; subject: string }> {
    const resumo = await this.financeiro.getResumoCancelamento(ra);
    if (!resumo.emailResponsavel) {
      throw new Error(
        `Aluno '${resumo.nomeAluno}' não tem e-mail de responsável cadastrado`,
      );
    }

    const escola = this.dadosEscola();
    const emailData: CancelamentoEmailData = {
      ...escola,
      nomeAluno: resumo.nomeAluno,
      numeroParcelasRestantes:
        overrides?.numeroParcelasRestantes ?? resumo.parcelasEmAberto,
      valorParcela: overrides?.valorParcela ?? resumo.valorParcela,
      somaValor: overrides?.somaValor ?? resumo.somaValor,
      valorMulta: overrides?.valorMulta ?? resumo.valorMulta,
      parcelasEmAtraso: overrides?.parcelasEmAtraso ?? resumo.parcelasEmAtraso,
      saldoDevedor: overrides?.saldoDevedor ?? resumo.saldoDevedor,
    };

    const template =
      tipo === 'academico'
        ? templateCancelamentoAcademico(emailData)
        : tipo === 'reembolso'
          ? templateCancelamentoReembolso(emailData)
          : templateCancelamentoFinanceiro(emailData);
    const tipoLog: EmailTipo =
      tipo === 'academico'
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
    return {
      enviado: true,
      para: resumo.emailResponsavel,
      subject: template.subject,
    };
  }

  /** Histórico de e-mails enviados (cobrança, leads, cancelamento) — exclui WhatsApp, que usa a mesma tabela. */
  async listarHistoricoEmail(
    page = 1,
    limit = 50,
  ): Promise<{
    items: EmailLog[];
    total: number;
    page: number;
    limit: number;
  }> {
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
   * Consulta a Sophia AO VIVO, aluno por aluno, em vez de ler o status de
   * pagamento do cache local (lancamentos_cache).
   *
   * Motivação (incidente de 2026-08-12, ver memória do projeto): o cache só
   * é atualizado pelo sync de hora em hora, e a Sophia às vezes substitui um
   * lançamento por outro (código E vencimento diferentes) sem nunca marcar
   * o antigo como pago -- ele ficava "pendente" pra sempre no cache, gerando
   * cobrança pra quem já tinha pago há semanas (caso real: Renata da Cruz
   * Silva). A camada de heurística de "substituto" adicionada depois
   * resolvia isso na maioria dos casos, mas ainda dependia de uma lista de
   * candidatos vinda do cache -- se o cache nunca soubesse que um lançamento
   * precisa ser reavaliado, ele nunca entrava nem na checagem.
   *
   * Indo direto na Sophia pra cada aluno, a lista de candidatos É a
   * realidade atual -- não existe "foto antiga" nenhuma pra sobreviver como
   * fantasma. O cache local continua existindo e sendo usado só pro ROSTER
   * de contato (nome/e-mail/codigoSophia via getClientesComEmail) -- esse
   * dado não tem o mesmo risco (não é status de pagamento, e o pior caso de
   * ficar desatualizado é não notificar alguém, não cobrar quem já pagou).
   *
   * O atraso de reconciliação da própria Sophia (ela demorar a marcar
   * `recebido` mesmo depois do pagamento cair) NÃO é resolvido por isso --
   * a checagem já era ao vivo nesse ponto antes desta mudança também. Só
   * desaparece de vez com a migração pro ipessp-core (webhook do Itaú).
   */
  async runEmailJob(origem: 'cron' | 'manual' = 'cron'): Promise<void> {
    if (!this.habilitado) {
      this.logger.warn(
        'Job de emails desabilitado (EMAIL_CRON_HABILITADO=false)',
      );
      return;
    }
    this.logger.log(`=== Iniciando job de emails (origem: ${origem}) ===`);

    const marcos = this.carregarMarcos();
    const somenteComCodigo =
      this.config.get<string>('email.somenteComCodigo') === 'true';
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const clientes = await this.financeiro.getClientesComEmail();
    this.logger.log(
      `${clientes.length} aluno(s) com e-mail cadastrado — consultando a Sophia ao vivo`,
    );

    // Fase 1 (concorrente, em lotes): só descobre QUEM tem marco de dia hoje
    // -- nenhum e-mail é enviado ainda aqui.
    let totalSemBoleto = 0;
    let totalFalhaConsulta = 0;
    const envios: EnvioPendente[] = [];

    for (let i = 0; i < clientes.length; i += SOPHIA_BATCH_SIZE) {
      const lote = clientes.slice(i, i + SOPHIA_BATCH_SIZE);
      const resultados = await Promise.allSettled(
        lote.map((cliente) =>
          this.buscarEnviosDoAluno(cliente, marcos, somenteComCodigo, hoje),
        ),
      );
      for (let j = 0; j < resultados.length; j++) {
        const r = resultados[j];
        if (r.status === 'fulfilled') {
          envios.push(...r.value.envios);
          totalSemBoleto += r.value.semBoleto;
        } else {
          totalFalhaConsulta++;
          this.logger.warn(
            `Falha ao consultar a Sophia pro aluno ${lote[j].codigoSophia} (${lote[j].nomeAluno}): ${errMsg(r.reason)} — pulando esse aluno nesta rodada.`,
          );
        }
      }
    }

    this.logger.log(`${envios.length} email(is) a enviar nesta rodada`);

    // Fase 2 (sequencial): o SMTP (Office 365) tem limite de conexões
    // concorrentes por conta -- mandar em paralelo (como a fase 1 faz com a
    // Sophia) já bateu esse limite em teste real
    // (`432 4.3.2 Concurrent connections limit exceeded`). Mesmo padrão
    // sequencial do job antigo.
    let totalEnviados = 0;
    let totalErros = 0;

    for (const envio of envios) {
      try {
        const { cliente, lanc, diffDias, venc, tipos } = envio;
        const email = cliente.emailResponsavel!;
        const emailData = this.buildEmailDataLive(
          cliente,
          lanc,
          diffDias,
          venc,
          escola,
        );
        const qrBuffer = lanc.codigoPix
          ? await gerarQrCode(lanc.codigoPix)
          : undefined;
        const codigoLancamento = String(lanc.codigo);

        for (const tipo of tipos) {
          const jaEnviado = await this.emailLogRepo.findOne({
            where: { codigoLancamento, tipo, enviado: true },
          });
          if (jaEnviado && mesmoDiaBR(new Date(jaEnviado.enviadoEm), hoje))
            continue;

          const template = templatePorTipo(tipo, emailData);

          const log = this.emailLogRepo.create({
            codigoLancamento,
            nome: cliente.nomeAluno,
            tipo,
            destinatario: email,
            enviado: false,
          });

          // Só os e-mails de cobrança (pós-vencimento) copiam o comercial —
          // lembrete, vencimento_hoje, aviso e renegociação ficam de fora.
          const ccComercial = tipo.startsWith('cobranca')
            ? this.config.get<string>('email.ccComercial') || undefined
            : undefined;

          try {
            await this.emailService.enviar(
              email,
              template.subject,
              template.html,
              qrBuffer
                ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }]
                : undefined,
              ccComercial ? { cc: ccComercial } : undefined,
            );
            log.enviado = true;
            totalEnviados++;
          } catch (err: unknown) {
            log.erro = errMsg(err);
            totalErros++;
            this.logger.error(
              `Erro ao enviar email para ${email}: ${errMsg(err)}`,
            );
          }

          await this.emailLogRepo.save(log);
        }
      } catch (err: unknown) {
        this.logger.error(
          `Erro ao processar lançamento ${envio.lanc.codigo} (aluno ${envio.cliente.codigoSophia}): ${errMsg(err)}`,
        );
      }
    }

    this.logger.log(
      `=== Job de emails concluído: ${totalEnviados} enviados, ${totalErros} erros, ${totalSemBoleto} sem boleto (pulados), ${totalFalhaConsulta} aluno(s) c/ falha na consulta à Sophia (pulados) ===`,
    );
  }

  /**
   * Fase 1 de `runEmailJob` (e de `previewComDadosSophia`) -- só decide
   * quais lançamentos deste aluno batem marco de dia hoje, sem mandar nada.
   * Lançada em lote/concorrente pelo chamador; joga erro de API pra fora de
   * propósito (o `Promise.allSettled` do chamador conta como "falha na
   * consulta" e segue os outros, em vez de assumir silenciosamente "ainda
   * pendente" -- mesmo erro do incidente de 2026-08-12).
   */
  private async buscarEnviosDoAluno(
    cliente: ClienteCache,
    marcos: MarcosConfig,
    somenteComCodigo: boolean,
    hoje: Date,
  ): Promise<{ envios: EnvioPendente[]; semBoleto: number }> {
    const envios: EnvioPendente[] = [];
    let semBoleto = 0;

    if (!cliente.codigoSophia || !cliente.emailResponsavel) {
      return { envios, semBoleto };
    }

    const lancamentosAluno = await this.sophia.getLancamentosAluno(
      cliente.codigoSophia,
    );

    for (const lanc of lancamentosAluno) {
      if (lanc.recebido && lanc.recebido > 0) continue; // já pago -- não há nada a avaliar

      try {
        const venc = parseDateBR(lanc.dataVencimento.substring(0, 10));
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round(
          (venc.getTime() - hoje.getTime()) / 86_400_000,
        );
        let tipos = this.calcularTipos(
          diffDias,
          marcos.diasAntes,
          marcos.diasAviso,
          marcos.diasAposVencimento,
          marcos.diasRenegociacaoOverlap,
        );
        if (somenteComCodigo) {
          tipos = tipos.filter(
            (t) => !t.startsWith('aviso') && !t.startsWith('renegociacao'),
          );
        }
        if (tipos.length === 0) continue;

        // Só cobra quem já tem boleto/PIX gerado -- sem isso o email sairia
        // "vazio" (sem código pra pagar), o que confunde mais do que ajuda.
        if (!lanc.linhaDigitavel) {
          semBoleto++;
          continue;
        }

        envios.push({ cliente, lanc, diffDias, venc, tipos });
      } catch (err: unknown) {
        this.logger.error(
          `Erro ao calcular marco do lançamento ${lanc.codigo} (aluno ${cliente.codigoSophia}): ${errMsg(err)}`,
        );
      }
    }

    return { envios, semBoleto };
  }

  /**
   * Ainda usado só por `previewPorLancamento` (teste manual de um registro
   * específico do cache) -- o job real (`runEmailJob`) não depende mais
   * disso, porque nunca parte de uma lista vinda do cache em primeiro lugar
   * (ver comentário de `runEmailJob`). Mantido aqui porque a heurística de
   * substituto (`encontrarSubstitutosPagos`) segue sendo útil pra esse teste
   * pontual contra um id de cache específico.
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
        lancamentosAluno = await this.sophia.getLancamentosAluno(
          cliente.codigoSophia,
        );
        cacheAlunos.set(cliente.codigoSophia, lancamentosAluno);
      }

      const atual = lancamentosAluno.find(
        (l) => l.codigo === lancamento.codigoSophia,
      );

      if (atual) {
        if (atual.recebido > 0) {
          await this.lancamentoRepo.update(lancamento.id, { recebido: true });
          this.logger.log(
            `Lançamento ${lancamento.id} já estava pago na Sophia — pulando email e corrigindo cache local`,
          );
          return false;
        }
        return true;
      }

      const candidatos = encontrarSubstitutosPagos(
        {
          dataVencimento: lancamento.dataVencimento,
          valorPrevisto: lancamento.valorPrevisto,
        },
        lancamentosAluno,
      );

      if (candidatos.length === 1) {
        await this.lancamentoRepo.update(lancamento.id, { recebido: true });
        this.logger.log(
          `Lançamento ${lancamento.id} parece substituído por outro já pago (código ${candidatos[0].codigo}, vencimento ${candidatos[0].dataVencimento}) — pulando email e corrigindo cache local`,
        );
        return false;
      }

      this.logger.warn(
        `Lançamento ${lancamento.id} (código Sophia ${lancamento.codigoSophia}) não encontrado ao vivo na Sophia` +
          (candidatos.length > 1
            ? ` — ${candidatos.length} substitutos possíveis, ambíguo`
            : ' e sem substituto plausível') +
          ` — pulando email, REVISAR MANUALMENTE.`,
      );
      return false;
    } catch (err: unknown) {
      this.logger.warn(
        `Falha ao conferir pagamento ao vivo do lançamento ${lancamento.id}: ${errMsg(err)} — pulando envio por segurança.`,
      );
      return false;
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
      if (diasAntes.includes(diffDias))
        tipos.push(EMAIL_ANTES_TIPO[diffDias] ?? 'lembrete');
      if (diasAviso.includes(diffDias))
        tipos.push(EMAIL_AVISO_TIPO[diffDias] ?? 'aviso');
      return tipos;
    }

    const diasAtraso = Math.abs(diffDias);
    const tipos: EmailTipo[] = [];
    if (diasAposVencimento.includes(diasAtraso))
      tipos.push(EMAIL_APOS_TIPO[diasAtraso] ?? 'cobranca');
    if (
      diasRenegociacaoOverlap.includes(diasAtraso) ||
      !diasAposVencimento.includes(diasAtraso)
    ) {
      tipos.push(sortearTipoRenegociacao());
    }
    return tipos;
  }

  /**
   * Mesma lógica do job real (`runEmailJob`), mas mandando pro destinatário
   * de teste em vez do responsável de cada aluno, e sem gravar em
   * `email_log`. Como consulta a Sophia ao vivo pra cada aluno com e-mail
   * cadastrado (mesma fonte do job real agora), esse preview tem o mesmo
   * custo/tempo de uma rodada real -- pode levar bem mais que os antigos
   * segundos de uma leitura só do cache.
   *
   * `diasSimulados` (opcional) restringe a busca a um único marco específico
   * — mesma convenção do diffDias interno (positivo = dias antes de vencer,
   * negativo = dias em atraso, 0 = vence hoje).
   *
   * `somenteComCodigo` (opcional) restringe aos tipos que embutem boleto/PIX
   * (lembrete_*, cobranca_*, vencimento_hoje) — exclui aviso_* e
   * renegociacao_*, que não têm código de pagamento.
   */
  async previewComDadosSophia(
    destinatario: string,
    diasSimulados?: number,
    somenteComCodigo?: boolean,
  ): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const marcos = this.carregarMarcos();
    const somenteComCodigoFinal =
      somenteComCodigo ??
      this.config.get<string>('email.somenteComCodigo') === 'true';

    if (
      diasSimulados !== undefined &&
      this.calcularTipos(
        diasSimulados,
        marcos.diasAntes,
        marcos.diasAviso,
        marcos.diasAposVencimento,
        marcos.diasRenegociacaoOverlap,
      ).length === 0
    ) {
      throw new Error(
        `O dia simulado (${diasSimulados}) não está em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS, e (se for atraso) já está coberto só pelo cobranca — nenhum email real seria disparado nesse marco.`,
      );
    }

    const clientes = await this.financeiro.getClientesComEmail();
    if (clientes.length === 0)
      throw new Error(
        'Nenhum aluno com e-mail cadastrado encontrado no cache local.',
      );

    // Fase 1 (concorrente, em lotes): só descobre quem bate o marco pedido.
    const envios: EnvioPendente[] = [];
    for (let i = 0; i < clientes.length; i += SOPHIA_BATCH_SIZE) {
      const lote = clientes.slice(i, i + SOPHIA_BATCH_SIZE);
      const resultados = await Promise.allSettled(
        lote.map((cliente) =>
          this.buscarEnviosDoAluno(
            cliente,
            marcos,
            somenteComCodigoFinal,
            hoje,
          ),
        ),
      );
      for (let j = 0; j < resultados.length; j++) {
        const r = resultados[j];
        if (r.status === 'fulfilled') {
          const filtrados =
            diasSimulados !== undefined
              ? r.value.envios.filter((e) => e.diffDias === diasSimulados)
              : r.value.envios;
          envios.push(...filtrados);
        } else {
          this.logger.warn(
            `previewComDadosSophia: falha ao consultar aluno ${lote[j].codigoSophia}: ${errMsg(r.reason)}`,
          );
        }
      }
    }

    // Fase 2 (sequencial): mesmo motivo do runEmailJob -- SMTP não aceita o
    // mesmo grau de concorrência da consulta à Sophia.
    const resultados: { aluno: string; tipo: string; lancamento: number }[] =
      [];
    for (const { cliente, lanc, diffDias, venc, tipos } of envios) {
      const emailData = this.buildEmailDataLive(
        cliente,
        lanc,
        diffDias,
        venc,
        escola,
      );
      const qrBuffer = lanc.codigoPix
        ? await gerarQrCode(lanc.codigoPix)
        : undefined;

      for (const tipo of tipos) {
        const template = templatePorTipo(tipo, emailData);
        await this.emailService.enviar(
          destinatario,
          `[PREVIEW] ${template.subject} — ${cliente.nomeAluno}`,
          template.html,
          qrBuffer
            ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }]
            : undefined,
        );
        resultados.push({
          aluno: cliente.nomeAluno,
          tipo,
          lancamento: lanc.codigo,
        });
      }
    }

    if (resultados.length === 0) {
      const motivo =
        diasSimulados !== undefined
          ? `Nenhuma pendência está exatamente ${diasSimulados} dia(s) em relação ao vencimento hoje (segundo a Sophia agora).`
          : 'Nenhuma pendência hoje bate exatamente com os dias configurados (EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS), segundo a Sophia agora.';
      throw new Error(
        motivo +
          ' Nenhum email real seria disparado agora. Use /email/test/cpf pra testar um aluno específico mesmo assim.',
      );
    }
    return resultados;
  }

  /**
   * `diasSimulados` (opcional) força o cenário de dia a testar, no lugar do
   * diffDias real do lançamento em aberto mais próximo — mesma convenção do
   * diffDias interno: positivo = dias antes de vencer, negativo = dias em
   * atraso, 0 = vence hoje. Consulta a Sophia ao vivo pra esse aluno (mesma
   * fonte do job real agora) -- só usa o cache local pra achar o
   * codigoSophia a partir do CPF.
   */
  async previewPorCpf(
    cpf: string,
    destinatario: string,
    diasSimulados?: number,
  ): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const cpfLimpo = cpf.replace(/\D/g, '');
    const clientes = await this.clienteRepo.find({ where: { cpf: cpfLimpo } });
    if (clientes.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado.',
      );
    }
    const cliente = clientes.find((c) => c.codigoSophia != null) ?? clientes[0];
    if (!cliente.codigoSophia) {
      throw new Error(
        `${cliente.nomeAluno} não tem código Sophia associado no cache local.`,
      );
    }

    const lancamentosAluno = await this.sophia.getLancamentosAluno(
      cliente.codigoSophia,
    );
    const abertos = lancamentosAluno.filter(
      (l) => !l.recebido || l.recebido <= 0,
    );
    if (abertos.length === 0) {
      throw new Error(
        `${cliente.nomeAluno} não possui lançamentos em aberto na Sophia.`,
      );
    }
    abertos.sort(
      (a, b) =>
        parseDateBR(a.dataVencimento.substring(0, 10)).getTime() -
        parseDateBR(b.dataVencimento.substring(0, 10)).getTime(),
    );
    const pend = abertos[0];

    const marcos = this.carregarMarcos();

    let venc: Date;
    let diffDias: number;
    if (diasSimulados !== undefined) {
      diffDias = diasSimulados;
      venc = new Date(hoje.getTime() + diasSimulados * 86_400_000);
    } else {
      venc = parseDateBR(pend.dataVencimento.substring(0, 10));
      venc.setHours(0, 0, 0, 0);
      diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);
    }

    let tipos = this.calcularTipos(
      diffDias,
      marcos.diasAntes,
      marcos.diasAviso,
      marcos.diasAposVencimento,
      marcos.diasRenegociacaoOverlap,
    );
    if (diasSimulados !== undefined && tipos.length === 0) {
      throw new Error(
        `O dia simulado (${diasSimulados}) não está em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS, e (se for atraso) já está coberto só pelo cobranca — nenhum email real seria disparado nesse marco.`,
      );
    }
    if (tipos.length === 0) {
      tipos = [
        diffDias === 0
          ? 'vencimento_hoje'
          : diffDias < 0
            ? 'cobranca'
            : 'lembrete',
      ];
    }

    const emailData = this.buildEmailDataLive(
      cliente,
      pend,
      diffDias,
      venc,
      escola,
    );
    const qrBuffer = pend.codigoPix
      ? await gerarQrCode(pend.codigoPix)
      : undefined;
    const resultados: { aluno: string; tipo: string; lancamento: number }[] =
      [];

    for (const tipo of tipos) {
      const template = templatePorTipo(tipo, emailData);
      await this.emailService.enviar(
        destinatario,
        `[PREVIEW] ${template.subject}`,
        template.html,
        qrBuffer
          ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }]
          : undefined,
      );
      resultados.push({
        aluno: cliente.nomeAluno,
        tipo,
        lancamento: pend.codigo,
      });
    }
    return resultados;
  }

  /**
   * Teste manual de UM registro específico do cache local (`codigoLancamento`
   * = id de `lancamentos_cache`, não código da Sophia) — diferente do job
   * real e dos outros previews, que não dependem mais do cache pra decidir
   * status de pagamento. Útil pra reproduzir/inspecionar um envio antigo já
   * registrado no banco. `diasSimulados` — ver comentário de previewPorCpf.
   */
  async previewPorLancamento(
    codigoLancamento: number,
    destinatario: string,
    diasSimulados?: number,
  ): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
    const escola = this.dadosEscola();
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const lancamento = await this.lancamentoRepo.findOne({
      where: { id: codigoLancamento },
    });
    if (!lancamento)
      throw new NotFoundException(
        `Lançamento ${codigoLancamento} não encontrado`,
      );

    const cliente = await this.clienteRepo.findOne({
      where: { id: lancamento.codigoCliente },
    });
    if (!cliente)
      throw new NotFoundException(
        `Cliente do lançamento ${codigoLancamento} não encontrado`,
      );

    if (!(await this.aindaPendenteNaSophia(cliente, lancamento, new Map()))) {
      throw new Error(
        `Lançamento ${codigoLancamento} já está pago (ou não encontrado/ambíguo) na Sophia.`,
      );
    }

    const marcos = this.carregarMarcos();

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

    let tipos = this.calcularTipos(
      diffDias,
      marcos.diasAntes,
      marcos.diasAviso,
      marcos.diasAposVencimento,
      marcos.diasRenegociacaoOverlap,
    );
    if (diasSimulados !== undefined && tipos.length === 0) {
      throw new Error(
        `O dia simulado (${diasSimulados}) não está em EMAIL_DIAS_ANTES/EMAIL_DIAS_AVISO/EMAIL_DIAS_APOS, e (se for atraso) já está coberto só pelo cobranca — nenhum email real seria disparado nesse marco.`,
      );
    }
    if (tipos.length === 0) {
      tipos = [
        diffDias === 0
          ? 'vencimento_hoje'
          : diffDias < 0
            ? 'cobranca'
            : 'lembrete',
      ];
    }

    const emailData: EmailData = {
      nomeAluno: cliente.nomeAluno,
      nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
      descricao: 'Mensalidade',
      valor: `R$ ${Number(lancamento.valorPrevisto).toFixed(2).replace('.', ',')}`,
      vencimento: venc.toLocaleDateString('pt-BR'),
      diasRestantes: diffDias > 0 ? diffDias : undefined,
      diasAtraso: diffDias < 0 ? Math.abs(diffDias) : undefined,
      codigoBarras: lancamento.linhaDigitavel ?? undefined,
      urlBoleto: lancamento.urlBoleto ?? undefined,
      codigoPix: lancamento.codigoPix ?? undefined,
      qrCodeUrl: lancamento.codigoPix ? `cid:${QR_CID}` : undefined,
      codigoMatricula: cliente.ra ?? String(cliente.codigoSophia ?? cliente.id),
      competencia: lancamento.competencia
        ? this.formatarCompetencia(lancamento.competencia)
        : undefined,
      ...escola,
    };

    const qrBuffer = lancamento.codigoPix
      ? await gerarQrCode(lancamento.codigoPix)
      : undefined;
    const resultados: { aluno: string; tipo: string; lancamento: number }[] =
      [];

    for (const tipo of tipos) {
      const template = templatePorTipo(tipo, emailData);
      await this.emailService.enviar(
        destinatario,
        `[PREVIEW] ${template.subject}`,
        template.html,
        qrBuffer
          ? [{ cid: QR_CID, buffer: qrBuffer, nome: 'qrpix.png' }]
          : undefined,
      );
      resultados.push({
        aluno: cliente.nomeAluno,
        tipo,
        lancamento: lancamento.id,
      });
    }
    return resultados;
  }
}
