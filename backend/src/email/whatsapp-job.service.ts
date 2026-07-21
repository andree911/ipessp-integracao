import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { errMsg } from '../common/err.util';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { WhatsAppService } from './whatsapp.service';
import { EmailLog, EmailTipo } from './entities/email-log.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { LancamentoCache } from '../financeiro/entities/lancamento-cache.entity';
import { parseDateBR } from '../common/date.util';

const WPP_ANTES_TIPO: Record<number, EmailTipo> = {
  7: 'wpp_antes_7',
  5: 'wpp_antes_5',
  3: 'wpp_antes_3',
  1: 'wpp_antes_1',
};
const WPP_APOS_TIPO: Record<number, EmailTipo> = {
  1: 'wpp_apos_1',
  2: 'wpp_apos_2',
  3: 'wpp_apos_3',
  7: 'wpp_apos_7',
  8: 'wpp_apos_8',
  9: 'wpp_apos_9',
  10: 'wpp_apos_10',
  12: 'wpp_apos_12',
  15: 'wpp_apos_15',
  20: 'wpp_apos_20',
};

// Delay randômico entre cada envio do job — ver guia_integracao_whatsapp_zapi_n8n.md
// seção 4: disparo em lote sem pausa entre mensagens é o padrão que mais aciona
// banimento por comportamento não-humano, mesmo em fluxo autorizado pelo destinatário.
const DELAY_MIN_MS = 3_000;
const DELAY_MAX_MS = 9_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function delayAleatorio(): Promise<void> {
  return sleep(DELAY_MIN_MS + Math.random() * (DELAY_MAX_MS - DELAY_MIN_MS));
}

function escolher(variantes: string[]): string {
  return variantes[Math.floor(Math.random() * variantes.length)];
}

interface MensagemDados {
  nomeResponsavel: string;
  nomeAluno: string;
  vencimento: string;
  codigoPix?: string;
  portalLink?: string;
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
    @InjectRepository(ClienteCache)
    private readonly clienteRepo: Repository<ClienteCache>,
    @InjectRepository(LancamentoCache)
    private readonly lancamentoRepo: Repository<LancamentoCache>,
  ) {}

  // Cada dia mapeia pra 2 variantes com o mesmo conteúdo/tom, sorteadas por
  // envio — evita que centenas de destinatários no mesmo dia recebam texto
  // byte-a-byte idêntico (só o nome mudava antes), que é um padrão fácil de
  // sinalizar como spam.
  private montarMensagem(diffDias: number, d: MensagemDados): string {
    const nome = d.nomeResponsavel;
    const venc = d.vencimento;
    const pixBloco = d.codigoPix
      ? `\n\n*PIX Copia e Cola:*\n\`${d.codigoPix}\``
      : '';
    const cta = (label: string) =>
      d.portalLink ? `\n\n🔘 *${label}:* ${d.portalLink}` : '';
    const quickReply = (a: string, b: string) =>
      `\n\n↩️ Responda com: *${a}* ou *${b}*`;

    // ── Antes do vencimento ──────────────────────────────────────────────────
    if (diffDias === 7) {
      return escolher([
        `Oi, ${nome}! 👋\nPassando para lembrar que sua mensalidade com vencimento em *${venc}* já está disponível para pagamento.\nVocê pode pagar via PIX copia e cola ou pelo Portal do Aluno Sophia, onde também consegue emitir a 2ª via do boleto quando quiser.${pixBloco}\nAproveite para se antecipar e evitar imprevistos de última hora! 😉${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
        `Olá, ${nome}! 😊\nSua mensalidade vence em *${venc}* e já está liberada para pagamento. Você pode quitar via PIX copia e cola ou pelo Portal do Aluno Sophia, onde também dá pra emitir a 2ª via do boleto.${pixBloco}\nAdiantar o pagamento evita correria de última hora!${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
      ]);
    }
    if (diffDias === 5) {
      return escolher([
        `Olá, ${nome}!\nSua mensalidade vence em 5 dias (*${venc}*). Já está disponível para pagamento via PIX ou boleto, e também pelo Portal Sophia.${pixBloco}\nQue tal já deixar essa pendência resolvida? Assim você garante que tudo fique em dia sem se preocupar depois. 🙂${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
        `Oi, ${nome}, tudo certo?\nFaltam 5 dias para o vencimento da sua mensalidade (*${venc}*), que já pode ser paga via PIX, boleto ou pelo Portal Sophia.${pixBloco}\nVale a pena resolver isso logo e ficar tranquilo(a) depois. 🙂${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
      ]);
    }
    if (diffDias === 3) {
      return escolher([
        `${nome}, tudo bem?\nSua mensalidade vence em apenas 3 dias (*${venc}*). Para evitar juros e encargos por atraso, recomendamos realizar o pagamento o quanto antes.${pixBloco}\nO boleto também está disponível no Portal do Aluno Sophia, caso prefira pagar por lá.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar no Portal Sophia')}`,
        `Oi, ${nome}!\nFaltam só 3 dias para o vencimento da sua mensalidade (*${venc}*). Pagando antes do prazo você evita juros e encargos.${pixBloco}\nSe preferir, o boleto também está disponível no Portal do Aluno Sophia.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar no Portal Sophia')}`,
      ]);
    }
    if (diffDias === 1) {
      return escolher([
        `Atenção, ${nome}! 🚨\nSua mensalidade vence amanhã (*${venc}*). Para evitar a incidência de juros, o ideal é regularizar ainda hoje.${pixBloco}\nSe já efetuou o pagamento, pode desconsiderar esta mensagem. Qualquer dúvida, estamos por aqui!${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar no Portal Sophia')}`,
        `${nome}, passando um aviso rápido: sua mensalidade vence amanhã (*${venc}*). 🚨\nO ideal é regularizar ainda hoje pra não pegar juros.${pixBloco}\nJá pagou? Pode ignorar esta mensagem. Qualquer coisa, é só chamar!${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar no Portal Sophia')}`,
      ]);
    }

    // ── No dia do vencimento ─────────────────────────────────────────────────
    if (diffDias === 0) {
      return escolher([
        `${nome}! 📅\nO vencimento da sua mensalidade é hoje (*${venc}*). Este é o último dia para realizar o pagamento sem acréscimo de juros e encargos.${pixBloco}\nVocê também pode pagar diretamente pelo Portal do Aluno Sophia, de forma rápida e segura.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar agora')}`,
        `Oi, ${nome}! 📅\nHoje (*${venc}*) é o último dia para pagar sua mensalidade sem juros nem encargos.${pixBloco}\nDá pra resolver rapidinho pelo Portal do Aluno Sophia também.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar agora')}`,
      ]);
    }

    // ── Após o vencimento ────────────────────────────────────────────────────
    const atraso = Math.abs(diffDias);

    if (atraso === 1) {
      return escolher([
        `Oi, ${nome}.\nNotamos que sua mensalidade com vencimento em *${venc}* não foi identificada em nosso sistema até o momento.\nPara evitar o acréscimo de juros e encargos, pedimos que regularize o quanto antes.${pixBloco}\nSe já efetuou o pagamento, pode desconsiderar esta mensagem. 🙂${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar agora')}`,
        `${nome}, tudo bem?\nAté agora não identificamos o pagamento da sua mensalidade que venceu em *${venc}*.\nPedimos que regularize o quanto antes pra evitar juros e encargos.${pixBloco}\nJá pagou? Pode desconsiderar este aviso. 🙂${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar agora')}`,
      ]);
    }
    if (atraso === 2) {
      return escolher([
        `Olá, ${nome}.\nSua mensalidade com vencimento em *${venc}* segue em aberto há 2 dias.\nPara evitar maiores encargos, recomendamos a regularização o quanto antes.${pixBloco}\nVocê também pode acessar o Portal Sophia para consultar e pagar diretamente por lá.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar no Portal')}`,
        `${nome}, oi.\nJá se passaram 2 dias desde o vencimento da sua mensalidade (*${venc}*), que segue em aberto.\nRegularizar logo evita o acúmulo de encargos.${pixBloco}\nVocê pode consultar e pagar direto pelo Portal Sophia.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar no Portal')}`,
      ]);
    }
    if (atraso === 3) {
      return escolher([
        `${nome}, tudo bem?\nIdentificamos que sua mensalidade está em aberto há 3 dias. Pedimos, por gentileza, que regularize o pagamento para evitar juros adicionais.${pixBloco}\nSe precisar de ajuda ou já pagou, é só nos avisar por aqui!${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Pagar agora')}`,
        `Oi, ${nome}.\nSua mensalidade (*${venc}*) está em aberto há 3 dias. Pedimos que regularize assim que possível pra não acumular juros.${pixBloco}\nPrecisa de ajuda ou já pagou? É só nos avisar!${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Pagar agora')}`,
      ]);
    }
    if (atraso === 7) {
      return escolher([
        `Olá, ${nome}.\nSua mensalidade encontra-se em aberto há 7 dias. Reforçamos a importância da regularização para evitar o acréscimo de encargos e possíveis restrições acadêmicas.${pixBloco}\nVocê pode consultar e pagar também pelo Portal Sophia.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
        `${nome}, tudo bem?\nJá são 7 dias com a mensalidade em aberto. É importante regularizar logo pra evitar mais encargos e possíveis restrições acadêmicas.${pixBloco}\nO Portal Sophia também está disponível pra consulta e pagamento.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
      ]);
    }
    if (atraso === 8) {
      return escolher([
        `Oi, ${nome}.\nSua mensalidade segue pendente há 8 dias. Para evitar transtornos, pedimos que a regularização seja feita o quanto antes.${pixBloco}\nEstamos à disposição para ajudar com o que for preciso!${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar no Portal')}`,
        `${nome}, passando aqui de novo.\nSua mensalidade continua pendente há 8 dias. Pra evitar transtorno, regularize assim que puder.${pixBloco}\nQualquer coisa, estamos à disposição!${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Pagar no Portal')}`,
      ]);
    }
    if (atraso === 9) {
      return escolher([
        `${nome}, sua mensalidade está em aberto há 9 dias.\nPara evitar o aumento dos juros e encargos contratuais, solicitamos a regularização com urgência.${pixBloco}\nCaso já tenha pago, pode desconsiderar esta mensagem.${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar agora')}`,
        `Oi, ${nome}.\nJá faz 9 dias que sua mensalidade está em aberto. Pedimos regularização urgente pra não aumentar juros e encargos.${pixBloco}\nSe já pagou, desconsidere este aviso.${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar agora')}`,
      ]);
    }
    if (atraso === 10) {
      return escolher([
        `Atenção, ${nome}. 📌\nSua mensalidade está em atraso há 10 dias. A continuidade do débito pode gerar restrições acadêmicas, como bloqueio de acesso a notas e boletos.${pixBloco}\nPedimos a regularização o quanto antes para evitar maiores transtornos.${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar no Portal Sophia')}`,
        `${nome}, um alerta importante. 📌\nJá são 10 dias de atraso na sua mensalidade. Isso pode gerar restrições acadêmicas, como bloqueio de notas e boletos.${pixBloco}\nRegularize o quanto antes pra evitar mais transtorno.${quickReply('Já paguei', 'Quero negociar')}${cta('Pagar no Portal Sophia')}`,
      ]);
    }
    if (atraso === 12) {
      return escolher([
        `${nome}, sua mensalidade está vencida há 12 dias.\nSolicitamos, por gentileza, que a regularização seja realizada com urgência, a fim de evitar o acréscimo de juros e possíveis restrições acadêmicas.${pixBloco}\nCaso tenha alguma dificuldade, entre em contato para avaliarmos opções de negociação.${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Pagar no Portal Sophia')}`,
        `Oi, ${nome}.\nJá são 12 dias de mensalidade vencida. Pedimos que regularize com urgência, pra evitar mais juros e possíveis restrições acadêmicas.${pixBloco}\nSe estiver com dificuldade, fale com a gente — dá pra avaliar opções de negociação.${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Pagar no Portal Sophia')}`,
      ]);
    }
    if (atraso === 15) {
      return escolher([
        `Olá, ${nome}.\nSua mensalidade está em aberto há 15 dias, já sujeita ao acréscimo de juros e encargos contratuais.\nPedimos que a quitação seja providenciada o quanto antes.${pixBloco}\nSe desejar negociar valores ou condições, é só nos chamar por aqui.${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Resolver no Portal Sophia')}`,
        `${nome}, tudo bem?\nJá se passaram 15 dias desde o vencimento, e a mensalidade já está sujeita a juros e encargos contratuais.\nPedimos que a quitação seja feita o quanto antes.${pixBloco}\nQuer negociar valores ou condições? É só chamar!${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Resolver no Portal Sophia')}`,
      ]);
    }
    if (atraso === 20) {
      return escolher([
        `${nome}, atenção: sua mensalidade está em atraso há 20 dias. ⚠️\nA manutenção do débito pode acarretar restrições acadêmicas, incluindo bloqueio de acesso a notas, boletos e matrícula.${pixBloco}\nPedimos a regularização imediata. Caso tenha dificuldades para o pagamento, entre em contato para negociarmos juntos a melhor solução.${quickReply('Já paguei', 'Quero negociar')}${cta('Resolver no Portal Sophia')}`,
        `Oi, ${nome}. ⚠️\nJá são 20 dias de atraso na sua mensalidade. Isso pode acarretar restrições acadêmicas, como bloqueio de notas, boletos e matrícula.${pixBloco}\nPedimos regularização imediata. Com dificuldade pra pagar? Fale com a gente pra buscarmos a melhor solução juntos.${quickReply('Já paguei', 'Quero negociar')}${cta('Resolver no Portal Sophia')}`,
      ]);
    }

    // ── Fallback para dias não mapeados ──────────────────────────────────────
    if (diffDias > 0) {
      return escolher([
        `📅 Olá, ${nome}!\nSua mensalidade vence em *${diffDias} dia(s)* (*${venc}*). Efetue o pagamento em dia para evitar juros e encargos.${pixBloco}${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
        `📅 Oi, ${nome}!\nFaltam *${diffDias} dia(s)* pro vencimento da sua mensalidade (*${venc}*). Pague em dia pra evitar juros e encargos.${pixBloco}${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Acessar Portal Sophia')}`,
      ]);
    }
    return escolher([
      `⚠️ Olá, ${nome}!\nSua mensalidade está em aberto há *${atraso} dia(s)* (venceu em *${venc}*). Regularize o quanto antes para evitar maiores encargos.${pixBloco}${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Acessar Portal')}`,
      `⚠️ Oi, ${nome}!\nJá são *${atraso} dia(s)* de mensalidade em aberto (venceu em *${venc}*). Quanto antes regularizar, menos encargos acumulam.${pixBloco}${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Acessar Portal')}`,
    ]);
  }

  @Cron('0 8 * * *', { name: 'wpp_job', timeZone: 'America/Sao_Paulo' })
  async runWhatsAppJob(): Promise<void> {
    if (this.config.get<string>('zapi.cronHabilitado') !== 'true') {
      this.logger.warn(
        'Job de WhatsApp desabilitado (WPP_CRON_HABILITADO=false)',
      );
      return;
    }

    this.logger.log('=== Iniciando job de WhatsApp ===');

    const diasAntes: number[] = this.config.get<number[]>('zapi.diasAntes') ?? [
      7, 5, 3, 1,
    ];
    const diasApos: number[] = this.config.get<number[]>('zapi.diasApos') ?? [
      1, 2, 3, 7, 8, 9, 10, 12, 15, 20,
    ];
    const portalLink =
      this.config.get<string>('email.linkPortalAluno') ||
      this.config.get<string>('email.siteUrl') ||
      undefined;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const BATCH_LIMIT = 500;
    const pendentes = (await this.financeiro.getLancamentosPendentes()).slice(
      0,
      BATCH_LIMIT,
    );
    let totalEnviados = 0;
    let totalErros = 0;
    let totalSemBoleto = 0;

    for (const { cliente, lancamento } of pendentes) {
      if (!cliente.telefoneResponsavel) continue;

      try {
        const venc = parseDateBR(lancamento.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round(
          (venc.getTime() - hoje.getTime()) / 86_400_000,
        );

        let tipo: EmailTipo | null = null;

        if (diffDias === 0) {
          tipo = 'wpp_vencimento_hoje';
        } else if (diffDias > 0 && diasAntes.includes(diffDias)) {
          tipo = WPP_ANTES_TIPO[diffDias] ?? 'wpp_lembrete';
        } else if (diffDias < 0 && diasApos.includes(Math.abs(diffDias))) {
          tipo = WPP_APOS_TIPO[Math.abs(diffDias)] ?? 'wpp_cobranca';
        }

        if (!tipo) continue;

        // Só cobra quem já tem o PIX gerado e sincronizado no cache — é o
        // único dado de pagamento que essa mensagem inclui (montarMensagem
        // só usa codigoPix, nunca linhaDigitavel/urlBoleto); sem isso a
        // mensagem sairia sem nenhuma forma de pagamento anexada (ver mesmo
        // ajuste em email-job.service.ts).
        if (!lancamento.codigoPix) {
          totalSemBoleto++;
          continue;
        }

        const jaEnviado = await this.logRepo.findOne({
          where: {
            codigoLancamento: String(lancamento.id),
            tipo,
            enviado: true,
          },
        });
        if (
          jaEnviado &&
          new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString()
        )
          continue;

        const mensagem = this.montarMensagem(diffDias, {
          nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
          nomeAluno: cliente.nomeAluno,
          vencimento: venc.toLocaleDateString('pt-BR'),
          codigoPix: lancamento.codigoPix ?? undefined,
          portalLink,
        });

        const log = this.logRepo.create({
          codigoLancamento: String(lancamento.id),
          nome: cliente.nomeAluno,
          tipo,
          destinatario: cliente.telefoneResponsavel,
          enviado: false,
        });

        // Delay randômico antes de cada envio — nunca dispara em sequência
        // instantânea (ver comentário no topo do arquivo).
        await delayAleatorio();

        try {
          await this.whatsapp.enviarTexto(
            cliente.telefoneResponsavel,
            mensagem,
          );
          log.enviado = true;
          totalEnviados++;
        } catch (err: unknown) {
          log.erro = errMsg(err);
          totalErros++;
          this.logger.error(
            `Erro WhatsApp ${cliente.telefoneResponsavel}: ${errMsg(err)}`,
          );
        }

        await this.logRepo.save(log);
      } catch (err: unknown) {
        this.logger.error(
          `Erro ao processar lançamento ${lancamento.id}: ${errMsg(err)}`,
        );
      }
    }

    this.logger.log(
      `=== Job WhatsApp concluído: ${totalEnviados} enviados, ${totalErros} erros, ${totalSemBoleto} sem PIX (pulados) ===`,
    );
  }

  /**
   * Preview isolado: monta a mensagem real de um aluno específico (por CPF) e manda
   * para `para` (ex.: o próprio número do responsável pelo teste), sem tocar no lote
   * do cron nem no telefone real cadastrado do responsável do aluno.
   */
  async previewPorCpf(
    cpf: string,
    para: string,
    diasSimulados?: number,
  ): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const clientes = await this.clienteRepo.find({ where: { cpf: cpfLimpo } });
    if (clientes.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado. Verifique se o CPF do responsável financeiro está cadastrado.',
      );
    }

    const lancamentos = await this.lancamentoRepo.find({
      where: { codigoCliente: In(clientes.map((c) => c.id)), recebido: false },
    });
    if (lancamentos.length === 0) {
      throw new Error(
        `${clientes[0].nomeAluno} não possui lançamentos em aberto`,
      );
    }

    lancamentos.sort((a, b) =>
      a.dataVencimento.localeCompare(b.dataVencimento),
    );
    const lancamento = lancamentos[0];
    const cliente = clientes.find((c) => c.id === lancamento.codigoCliente)!;

    return [await this.enviarPreview(cliente, lancamento, para, diasSimulados)];
  }

  /** `diasSimulados` — ver comentário de previewPorCpf, mesma convenção. */
  async previewPorLancamento(
    codigoLancamento: number,
    para: string,
    diasSimulados?: number,
  ): Promise<{ aluno: string; tipo: string; lancamento: number }[]> {
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

    return [await this.enviarPreview(cliente, lancamento, para, diasSimulados)];
  }

  private async enviarPreview(
    cliente: ClienteCache,
    lancamento: LancamentoCache,
    para: string,
    diasSimulados?: number,
  ): Promise<{ aluno: string; tipo: string; lancamento: number }> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

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

    const portalLink =
      this.config.get<string>('email.linkPortalAluno') ||
      this.config.get<string>('email.siteUrl') ||
      undefined;

    const mensagem = this.montarMensagem(diffDias, {
      nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
      nomeAluno: cliente.nomeAluno,
      vencimento: venc.toLocaleDateString('pt-BR'),
      codigoPix: lancamento.codigoPix ?? undefined,
      portalLink,
    });

    await this.whatsapp.enviarTexto(para, `🧪 *[PREVIEW]*\n\n${mensagem}`);

    const tipo =
      diffDias === 0
        ? 'wpp_vencimento_hoje'
        : diffDias > 0
          ? (WPP_ANTES_TIPO[diffDias] ?? 'wpp_lembrete')
          : (WPP_APOS_TIPO[Math.abs(diffDias)] ?? 'wpp_cobranca');

    return { aluno: cliente.nomeAluno, tipo, lancamento: lancamento.id };
  }
}
