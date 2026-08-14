import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { errMsg } from '../common/err.util';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { SophiaService } from '../sophia/sophia.service';
import { LancamentoAlunoApiModel } from '../sophia/types/sophia.types';
import { WhatsAppService } from './whatsapp.service';
import { EmailLog, EmailTipo } from './entities/email-log.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { LancamentoCache } from '../financeiro/entities/lancamento-cache.entity';
import { parseDateBR } from '../common/date.util';

// Batch de chamadas concorrentes à Sophia por rodada -- mesmo valor e mesmo
// motivo do EmailJobService (SOPHIA_BATCH_SIZE).
const SOPHIA_BATCH_SIZE = 5;

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

interface OpcaoLista {
  id: string;
  title: string;
}

/** Um envio já decidido (bateu marco de dia, tem PIX) -- ver mesma interface em EmailJobService. */
interface EnvioPendente {
  cliente: ClienteCache;
  lanc: LancamentoAlunoApiModel;
  diffDias: number;
  venc: Date;
  tipo: EmailTipo;
}

@Injectable()
export class WhatsAppJobService {
  private readonly logger = new Logger(WhatsAppJobService.name);

  constructor(
    private readonly financeiro: FinanceiroService,
    private readonly whatsapp: WhatsAppService,
    private readonly config: ConfigService,
    private readonly sophia: SophiaService,
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
  private montarMensagem(
    diffDias: number,
    d: MensagemDados,
  ): { texto: string; opcoes: OpcaoLista[] } {
    const nome = d.nomeResponsavel;
    const venc = d.vencimento;
    const pixBloco = d.codigoPix
      ? `\n\n*PIX Copia e Cola:*\n\`${d.codigoPix}\``
      : '';
    // cta()/quickReply() não embutem mais texto na mensagem — viram itens da
    // lista nativa do WhatsApp (ver enviarListaOpcoes em whatsapp.service.ts).
    // As duas variantes sorteadas por escolher() chamam cta()/quickReply() —
    // guarda por id evita empurrar a opção 2x (uma por variante avaliada).
    const opcoes: OpcaoLista[] = [];
    const cta = (label: string) => {
      if (d.portalLink && !opcoes.some((o) => o.id === 'portal')) {
        opcoes.push({ id: 'portal', title: `🔗 ${label}` });
      }
      return '';
    };
    const quickReply = (a: string, b: string) => {
      if (!opcoes.some((o) => o.id === 'ja_paguei')) {
        opcoes.push({ id: 'ja_paguei', title: `✅ ${a}` });
        opcoes.push({ id: 'ajuda', title: `❓ ${b}` });
      }
      return '';
    };

    // ── Antes do vencimento ──────────────────────────────────────────────────
    if (diffDias === 7) {
      return {
        texto: escolher([
          `Oi, ${nome}! 👋\nPassando para lembrar que sua mensalidade com vencimento em *${venc}* já está disponível para pagamento.\nVocê pode pagar via PIX copia e cola ou pelo Portal do Aluno Sophia, onde também consegue emitir a 2ª via do boleto quando quiser.${pixBloco}\nAproveite para se antecipar e evitar imprevistos de última hora! 😉${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `Olá, ${nome}! 😊\nSua mensalidade vence em *${venc}* e já está liberada para pagamento. Você pode quitar via PIX copia e cola ou pelo Portal do Aluno Sophia, onde também dá pra emitir a 2ª via do boleto.${pixBloco}\nAdiantar o pagamento evita correria de última hora!${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (diffDias === 5) {
      return {
        texto: escolher([
          `Olá, ${nome}!\nSua mensalidade vence em 5 dias (*${venc}*). Já está disponível para pagamento via PIX ou boleto, e também pelo Portal Sophia.${pixBloco}\nQue tal já deixar essa pendência resolvida? Assim você garante que tudo fique em dia sem se preocupar depois. 🙂${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `Oi, ${nome}, tudo certo?\nFaltam 5 dias para o vencimento da sua mensalidade (*${venc}*), que já pode ser paga via PIX, boleto ou pelo Portal Sophia.${pixBloco}\nVale a pena resolver isso logo e ficar tranquilo(a) depois. 🙂${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (diffDias === 3) {
      return {
        texto: escolher([
          `${nome}, tudo bem?\nSua mensalidade vence em apenas 3 dias (*${venc}*). Para evitar juros e encargos por atraso, recomendamos realizar o pagamento o quanto antes.${pixBloco}\nO boleto também está disponível no Portal do Aluno Sophia, caso prefira pagar por lá.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `Oi, ${nome}!\nFaltam só 3 dias para o vencimento da sua mensalidade (*${venc}*). Pagando antes do prazo você evita juros e encargos.${pixBloco}\nSe preferir, o boleto também está disponível no Portal do Aluno Sophia.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (diffDias === 1) {
      return {
        texto: escolher([
          `Atenção, ${nome}! 🚨\nSua mensalidade vence amanhã (*${venc}*). Para evitar a incidência de juros, o ideal é regularizar ainda hoje.${pixBloco}\nSe já efetuou o pagamento, pode desconsiderar esta mensagem. Qualquer dúvida, estamos por aqui!${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
          `${nome}, passando um aviso rápido: sua mensalidade vence amanhã (*${venc}*). 🚨\nO ideal é regularizar ainda hoje pra não pegar juros.${pixBloco}\nJá pagou? Pode ignorar esta mensagem. Qualquer coisa, é só chamar!${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }

    // ── No dia do vencimento ─────────────────────────────────────────────────
    if (diffDias === 0) {
      return {
        texto: escolher([
          `${nome}! 📅\nO vencimento da sua mensalidade é hoje (*${venc}*). Este é o último dia para realizar o pagamento sem acréscimo de juros e encargos.${pixBloco}\nVocê também pode pagar diretamente pelo Portal do Aluno Sophia, de forma rápida e segura.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `Oi, ${nome}! 📅\nHoje (*${venc}*) é o último dia para pagar sua mensalidade sem juros nem encargos.${pixBloco}\nDá pra resolver rapidinho pelo Portal do Aluno Sophia também.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }

    // ── Após o vencimento ────────────────────────────────────────────────────
    const atraso = Math.abs(diffDias);

    if (atraso === 1) {
      return {
        texto: escolher([
          `Oi, ${nome}.\nNotamos que sua mensalidade com vencimento em *${venc}* não foi identificada em nosso sistema até o momento.\nPara evitar o acréscimo de juros e encargos, pedimos que regularize o quanto antes.${pixBloco}\nSe já efetuou o pagamento, pode desconsiderar esta mensagem. 🙂${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
          `${nome}, tudo bem?\nAté agora não identificamos o pagamento da sua mensalidade que venceu em *${venc}*.\nPedimos que regularize o quanto antes pra evitar juros e encargos.${pixBloco}\nJá pagou? Pode desconsiderar este aviso. 🙂${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 2) {
      return {
        texto: escolher([
          `Olá, ${nome}.\nSua mensalidade com vencimento em *${venc}* segue em aberto há 2 dias.\nPara evitar maiores encargos, recomendamos a regularização o quanto antes.${pixBloco}\nVocê também pode acessar o Portal Sophia para consultar e pagar diretamente por lá.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `${nome}, oi.\nJá se passaram 2 dias desde o vencimento da sua mensalidade (*${venc}*), que segue em aberto.\nRegularizar logo evita o acúmulo de encargos.${pixBloco}\nVocê pode consultar e pagar direto pelo Portal Sophia.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 3) {
      return {
        texto: escolher([
          `${nome}, tudo bem?\nIdentificamos que sua mensalidade está em aberto há 3 dias. Pedimos, por gentileza, que regularize o pagamento para evitar juros adicionais.${pixBloco}\nSe precisar de ajuda ou já pagou, é só nos avisar por aqui!${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
          `Oi, ${nome}.\nSua mensalidade (*${venc}*) está em aberto há 3 dias. Pedimos que regularize assim que possível pra não acumular juros.${pixBloco}\nPrecisa de ajuda ou já pagou? É só nos avisar!${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 7) {
      return {
        texto: escolher([
          `Olá, ${nome}.\nSua mensalidade encontra-se em aberto há 7 dias. Reforçamos a importância da regularização para evitar o acréscimo de encargos e possíveis restrições acadêmicas.${pixBloco}\nVocê pode consultar e pagar também pelo Portal Sophia.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `${nome}, tudo bem?\nJá são 7 dias com a mensalidade em aberto. É importante regularizar logo pra evitar mais encargos e possíveis restrições acadêmicas.${pixBloco}\nO Portal Sophia também está disponível pra consulta e pagamento.${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 8) {
      return {
        texto: escolher([
          `Oi, ${nome}.\nSua mensalidade segue pendente há 8 dias. Para evitar transtornos, pedimos que a regularização seja feita o quanto antes.${pixBloco}\nEstamos à disposição para ajudar com o que for preciso!${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `${nome}, passando aqui de novo.\nSua mensalidade continua pendente há 8 dias. Pra evitar transtorno, regularize assim que puder.${pixBloco}\nQualquer coisa, estamos à disposição!${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 9) {
      return {
        texto: escolher([
          `${nome}, sua mensalidade está em aberto há 9 dias.\nPara evitar o aumento dos juros e encargos contratuais, solicitamos a regularização com urgência.${pixBloco}\nCaso já tenha pago, pode desconsiderar esta mensagem.${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
          `Oi, ${nome}.\nJá faz 9 dias que sua mensalidade está em aberto. Pedimos regularização urgente pra não aumentar juros e encargos.${pixBloco}\nSe já pagou, desconsidere este aviso.${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 10) {
      return {
        texto: escolher([
          `Atenção, ${nome}. 📌\nSua mensalidade está em atraso há 10 dias. A continuidade do débito pode gerar restrições acadêmicas, como bloqueio de acesso a notas e boletos.${pixBloco}\nPedimos a regularização o quanto antes para evitar maiores transtornos.${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
          `${nome}, um alerta importante. 📌\nJá são 10 dias de atraso na sua mensalidade. Isso pode gerar restrições acadêmicas, como bloqueio de notas e boletos.${pixBloco}\nRegularize o quanto antes pra evitar mais transtorno.${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 12) {
      return {
        texto: escolher([
          `${nome}, sua mensalidade está vencida há 12 dias.\nSolicitamos, por gentileza, que a regularização seja realizada com urgência, a fim de evitar o acréscimo de juros e possíveis restrições acadêmicas.${pixBloco}\nCaso tenha alguma dificuldade, entre em contato para avaliarmos opções de negociação.${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
          `Oi, ${nome}.\nJá são 12 dias de mensalidade vencida. Pedimos que regularize com urgência, pra evitar mais juros e possíveis restrições acadêmicas.${pixBloco}\nSe estiver com dificuldade, fale com a gente — dá pra avaliar opções de negociação.${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 15) {
      return {
        texto: escolher([
          `Olá, ${nome}.\nSua mensalidade está em aberto há 15 dias, já sujeita ao acréscimo de juros e encargos contratuais.\nPedimos que a quitação seja providenciada o quanto antes.${pixBloco}\nSe desejar negociar valores ou condições, é só nos chamar por aqui.${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
          `${nome}, tudo bem?\nJá se passaram 15 dias desde o vencimento, e a mensalidade já está sujeita a juros e encargos contratuais.\nPedimos que a quitação seja feita o quanto antes.${pixBloco}\nQuer negociar valores ou condições? É só chamar!${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    if (atraso === 20) {
      return {
        texto: escolher([
          `${nome}, atenção: sua mensalidade está em atraso há 20 dias. ⚠️\nA manutenção do débito pode acarretar restrições acadêmicas, incluindo bloqueio de acesso a notas, boletos e matrícula.${pixBloco}\nPedimos a regularização imediata. Caso tenha dificuldades para o pagamento, entre em contato para negociarmos juntos a melhor solução.${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
          `Oi, ${nome}. ⚠️\nJá são 20 dias de atraso na sua mensalidade. Isso pode acarretar restrições acadêmicas, como bloqueio de notas, boletos e matrícula.${pixBloco}\nPedimos regularização imediata. Com dificuldade pra pagar? Fale com a gente pra buscarmos a melhor solução juntos.${quickReply('Já paguei', 'Quero negociar')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }

    // ── Fallback para dias não mapeados ──────────────────────────────────────
    if (diffDias > 0) {
      return {
        texto: escolher([
          `📅 Olá, ${nome}!\nSua mensalidade vence em *${diffDias} dia(s)* (*${venc}*). Efetue o pagamento em dia para evitar juros e encargos.${pixBloco}${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
          `📅 Oi, ${nome}!\nFaltam *${diffDias} dia(s)* pro vencimento da sua mensalidade (*${venc}*). Pague em dia pra evitar juros e encargos.${pixBloco}${quickReply('Já paguei', 'Preciso de ajuda')}${cta('Quero pagar')}`,
        ]),
        opcoes,
      };
    }
    return {
      texto: escolher([
        `⚠️ Olá, ${nome}!\nSua mensalidade está em aberto há *${atraso} dia(s)* (venceu em *${venc}*). Regularize o quanto antes para evitar maiores encargos.${pixBloco}${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
        `⚠️ Oi, ${nome}!\nJá são *${atraso} dia(s)* de mensalidade em aberto (venceu em *${venc}*). Quanto antes regularizar, menos encargos acumulam.${pixBloco}${quickReply('Já paguei', 'Falar com o financeiro')}${cta('Quero pagar')}`,
      ]),
      opcoes,
    };
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

    const clientes = await this.financeiro.getClientesComTelefone();
    this.logger.log(
      `${clientes.length} aluno(s) com telefone cadastrado — consultando a Sophia ao vivo`,
    );

    // Fase 1 (concorrente, em lotes): só descobre quem bate marco de dia
    // hoje -- nenhuma mensagem é enviada ainda aqui. Mesma migração e mesmo
    // motivo do EmailJobService.runEmailJob (incidente 2026-08-12): ler
    // status de pagamento do cache local (lancamentos_cache) corria o risco
    // de um lançamento substituído na Sophia nunca ser reavaliado. Indo
    // direto na Sophia por aluno, a lista de lançamentos em aberto É a
    // realidade atual.
    let totalSemBoleto = 0;
    let totalFalhaConsulta = 0;
    const envios: EnvioPendente[] = [];

    for (let i = 0; i < clientes.length; i += SOPHIA_BATCH_SIZE) {
      const lote = clientes.slice(i, i + SOPHIA_BATCH_SIZE);
      const resultados = await Promise.allSettled(
        lote.map((cliente) =>
          this.buscarEnviosDoAluno(cliente, diasAntes, diasApos, hoje),
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

    // Teto de segurança pro volume de mensagens de UMA rodada -- não é sobre
    // limite de conexão (como o SMTP do e-mail), é anti-banimento: mandar
    // muito mais que o volume diário normal de uma vez é o tipo de pico que
    // mais chama atenção de detecção de spam do WhatsApp.
    const BATCH_LIMIT = 500;
    const enviosLimitados = envios.slice(0, BATCH_LIMIT);
    if (envios.length > BATCH_LIMIT) {
      this.logger.warn(
        `${envios.length} envios encontrados, cortando pro teto de ${BATCH_LIMIT} nesta rodada — o restante sai na próxima.`,
      );
    }

    this.logger.log(`${enviosLimitados.length} mensagem(ns) de WhatsApp a enviar nesta rodada`);

    // Fase 2 (sequencial, com delay randômico entre cada envio -- ver
    // montarMensagem/delayAleatorio no topo do arquivo).
    let totalEnviados = 0;
    let totalErros = 0;

    for (const { cliente, lanc, diffDias, venc, tipo } of enviosLimitados) {
      try {
        const codigoLancamento = String(lanc.codigo);
        const jaEnviado = await this.logRepo.findOne({
          where: { codigoLancamento, tipo, enviado: true },
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
          codigoPix: lanc.codigoPix ?? undefined,
          portalLink,
        });

        const log = this.logRepo.create({
          codigoLancamento,
          nome: cliente.nomeAluno,
          tipo,
          destinatario: cliente.telefoneResponsavel!,
          enviado: false,
        });

        await delayAleatorio();

        try {
          await this.enviar(
            cliente.telefoneResponsavel!,
            mensagem.texto,
            mensagem.opcoes,
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
          `Erro ao processar lançamento ${lanc.codigo} (aluno ${cliente.codigoSophia}): ${errMsg(err)}`,
        );
      }
    }

    this.logger.log(
      `=== Job WhatsApp concluído: ${totalEnviados} enviados, ${totalErros} erros, ${totalSemBoleto} sem PIX (pulados), ${totalFalhaConsulta} aluno(s) c/ falha na consulta à Sophia (pulados) ===`,
    );
  }

  /**
   * Fase 1 de runWhatsAppJob -- só decide quais lançamentos deste aluno
   * batem marco de dia hoje, sem mandar nada. Lançada em lote/concorrente
   * pelo chamador; joga erro de API pra fora de propósito (mesmo padrão de
   * EmailJobService.buscarEnviosDoAluno).
   */
  private async buscarEnviosDoAluno(
    cliente: ClienteCache,
    diasAntes: number[],
    diasApos: number[],
    hoje: Date,
  ): Promise<{ envios: EnvioPendente[]; semBoleto: number }> {
    const envios: EnvioPendente[] = [];
    let semBoleto = 0;

    if (!cliente.codigoSophia || !cliente.telefoneResponsavel) {
      return { envios, semBoleto };
    }

    const lancamentosAluno = await this.sophia.getLancamentosAluno(cliente.codigoSophia);

    for (const lanc of lancamentosAluno) {
      if (lanc.recebido && lanc.recebido > 0) continue; // já pago -- não há nada a avaliar

      try {
        const venc = parseDateBR(lanc.dataVencimento.substring(0, 10));
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((venc.getTime() - hoje.getTime()) / 86_400_000);

        let tipo: EmailTipo | null = null;
        if (diffDias === 0) {
          tipo = 'wpp_vencimento_hoje';
        } else if (diffDias > 0 && diasAntes.includes(diffDias)) {
          tipo = WPP_ANTES_TIPO[diffDias] ?? 'wpp_lembrete';
        } else if (diffDias < 0 && diasApos.includes(Math.abs(diffDias))) {
          tipo = WPP_APOS_TIPO[Math.abs(diffDias)] ?? 'wpp_cobranca';
        }
        if (!tipo) continue;

        // Só cobra quem já tem PIX gerado -- montarMensagem só usa
        // codigoPix, nunca linhaDigitavel/urlBoleto (mesmo ajuste do
        // EmailJobService).
        if (!lanc.codigoPix) {
          semBoleto++;
          continue;
        }

        envios.push({ cliente, lanc, diffDias, venc, tipo });
      } catch (err: unknown) {
        this.logger.error(`Erro ao calcular marco do lançamento ${lanc.codigo} (aluno ${cliente.codigoSophia}): ${errMsg(err)}`);
      }
    }

    return { envios, semBoleto };
  }

  /**
   * Preview isolado: consulta a Sophia ao vivo pro aluno (mesma fonte do job
   * real agora -- só usa o cache local pra achar o codigoSophia a partir do
   * CPF) e monta a mensagem real do lançamento em aberto mais próximo,
   * mandando pra `para` (ex.: o próprio número do responsável pelo teste),
   * sem tocar no telefone real cadastrado do responsável do aluno.
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
    const cliente = clientes.find((c) => c.codigoSophia != null) ?? clientes[0];
    if (!cliente.codigoSophia) {
      throw new Error(`${cliente.nomeAluno} não tem código Sophia associado no cache local.`);
    }

    const lancamentosAluno = await this.sophia.getLancamentosAluno(cliente.codigoSophia);
    const abertos = lancamentosAluno.filter((l) => !l.recebido || l.recebido <= 0);
    if (abertos.length === 0) {
      throw new Error(`${cliente.nomeAluno} não possui lançamentos em aberto na Sophia.`);
    }
    abertos.sort((a, b) =>
      parseDateBR(a.dataVencimento.substring(0, 10)).getTime() -
      parseDateBR(b.dataVencimento.substring(0, 10)).getTime(),
    );
    const lanc = abertos[0];

    return [await this.enviarPreviewLive(cliente, lanc, para, diasSimulados)];
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

    return [await this.enviarPreviewCache(cliente, lancamento, para, diasSimulados)];
  }

  /** Preview a partir do lançamento AO VIVO da Sophia -- usado por previewPorCpf. */
  private async enviarPreviewLive(
    cliente: ClienteCache,
    lanc: LancamentoAlunoApiModel,
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
      venc = parseDateBR(lanc.dataVencimento.substring(0, 10));
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
      codigoPix: lanc.codigoPix ?? undefined,
      portalLink,
    });

    await this.enviar(
      para,
      `🧪 *[PREVIEW]*\n\n${mensagem.texto}`,
      mensagem.opcoes,
    );

    const tipo =
      diffDias === 0
        ? 'wpp_vencimento_hoje'
        : diffDias > 0
          ? (WPP_ANTES_TIPO[diffDias] ?? 'wpp_lembrete')
          : (WPP_APOS_TIPO[Math.abs(diffDias)] ?? 'wpp_cobranca');

    return { aluno: cliente.nomeAluno, tipo, lancamento: lanc.codigo };
  }

  /** Preview a partir do cache local -- ver comentário de previewPorLancamento (teste manual, cache-based por design). */
  private async enviarPreviewCache(
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

    await this.enviar(
      para,
      `🧪 *[PREVIEW]*\n\n${mensagem.texto}`,
      mensagem.opcoes,
    );

    const tipo =
      diffDias === 0
        ? 'wpp_vencimento_hoje'
        : diffDias > 0
          ? (WPP_ANTES_TIPO[diffDias] ?? 'wpp_lembrete')
          : (WPP_APOS_TIPO[Math.abs(diffDias)] ?? 'wpp_cobranca');

    return { aluno: cliente.nomeAluno, tipo, lancamento: lancamento.id };
  }

  /**
   * Resposta a uma opção da lista da mensagem de cobrança (ja_paguei/ajuda/
   * portal) -- chamado pelo n8n quando o Z-API entrega um listResponseMessage
   * com um desses IDs. Esses 3 IDs não existem no mapa de menu principal do
   * bot (Bot-IPESSP-WhatsApp.roteado.json, node "Mapear Seleção do Menu"),
   * então sem essa rota eles caiam no agente de IA genérico só com o título
   * do botão como contexto, sem saber que veio de uma cobrança.
   */
  async responderOpcaoCobranca(
    selectedRowId: string,
    telefone: string,
  ): Promise<{ mensagem: string }> {
    if (selectedRowId === 'portal') {
      const mensagem = await this.enviarPixOuPortal(telefone);
      return { mensagem };
    }

    if (selectedRowId === 'ajuda') {
      const telefoneFinanceiro = this.config.get<string>('zapi.telefoneFinanceiro');
      const emailFinanceiro = this.config.get<string>('email.emailNotificacoes');
      const linkWa = telefoneFinanceiro ? `https://wa.me/${telefoneFinanceiro.replace(/\D/g, '')}` : undefined;
      const mensagem =
        (linkWa
          ? `Para tratar da sua pendência, entre em contato diretamente com o setor financeiro: ${linkWa}`
          : 'Para tratar da sua pendência, entre em contato com o setor financeiro.') +
        (emailFinanceiro ? `\n\nSe preferir, também pode mandar um e-mail: ${emailFinanceiro}` : '');
      await this.whatsapp.enviarTexto(telefone, mensagem);
      return { mensagem };
    }

    if (selectedRowId === 'ja_paguei') {
      const mensagem = await this.checarPagamentoAoVivo(telefone);
      await this.whatsapp.enviarTexto(telefone, mensagem);
      return { mensagem };
    }

    throw new NotFoundException(`Opção "${selectedRowId}" não reconhecida.`);
  }

  /**
   * Consulta a Sophia ao vivo pro(s) aluno(s) vinculado(s) a esse telefone --
   * mesma fonte do job real (ver runWhatsAppJob). Se mais de um aluno usa o
   * mesmo telefone de responsável (comum: pai/mãe com mais de um filho
   * matriculado), não adivinha qual -- pede pra especificar, porque dar a
   * resposta errada de pagamento pro aluno errado é pior que perguntar.
   */
  private async checarPagamentoAoVivo(telefone: string): Promise<string> {
    const clientes = await this.buscarClientesPorTelefone(telefone);

    if (clientes.length === 0) {
      return 'Obrigado por avisar! Vamos verificar seu pagamento e atualizar por aqui em breve.';
    }
    if (clientes.length > 1) {
      return 'Obrigado por avisar! Encontramos mais de um aluno vinculado a esse número — pra eu confirmar certinho, me diga o nome completo de quem fez o pagamento.';
    }

    const cliente = clientes[0];
    const nome = cliente.nomeResponsavel ?? cliente.nomeAluno;

    try {
      const lancamentos = await this.sophia.getLancamentosAluno(cliente.codigoSophia!);
      const abertos = lancamentos.filter((l) => !l.recebido || l.recebido <= 0);
      if (abertos.length === 0) {
        return `Confirmado, ${nome}! Não identificamos nenhuma pendência em aberto no seu nome. Obrigado! 😊`;
      }
      return `Oi, ${nome}! Ainda não identificamos esse pagamento no nosso sistema — isso é normal, pode levar até 3 dias úteis pra compensar (mais ainda se foi boleto). Se já pagou há mais tempo que isso, nos avise que vamos verificar com atenção.`;
    } catch (err: unknown) {
      this.logger.warn(`checarPagamentoAoVivo: falha ao consultar Sophia pro aluno ${cliente.codigoSophia}: ${errMsg(err)}`);
      return 'Obrigado por avisar! No momento não conseguimos consultar seu pagamento automaticamente — nossa equipe vai verificar manualmente.';
    }
  }

  /**
   * Busca o lançamento em aberto mais próximo do vencimento pro(s) aluno(s)
   * vinculado(s) a esse telefone (mesma consulta ao vivo de checarPagamentoAoVivo)
   * e manda o PIX copia-e-cola + QR code de imagem, com o link do Portal como
   * complemento -- não como única opção, que era o comportamento antigo.
   * Mesma regra de ambiguidade de checarPagamentoAoVivo: mais de um aluno no
   * mesmo telefone não adivinha qual, cai no link genérico do Portal.
   */
  private async enviarPixOuPortal(telefone: string): Promise<string> {
    const portalLink =
      this.config.get<string>('email.linkPortalAluno') ||
      this.config.get<string>('email.siteUrl');

    const enviarSoLink = async (): Promise<string> => {
      const mensagem = portalLink
        ? `Aqui está o link do Portal do Aluno Sophia: ${portalLink}`
        : 'No momento não temos o link do Portal disponível — qualquer dúvida, fale com a secretaria.';
      await this.whatsapp.enviarTexto(telefone, mensagem);
      return mensagem;
    };

    const clientes = await this.buscarClientesPorTelefone(telefone);
    if (clientes.length !== 1) return enviarSoLink();

    const cliente = clientes[0];
    try {
      const lancamentos = await this.sophia.getLancamentosAluno(cliente.codigoSophia!);
      const abertos = lancamentos.filter((l) => !l.recebido || l.recebido <= 0);
      if (abertos.length === 0) {
        const mensagem = `Não encontramos nenhuma pendência em aberto no seu nome.${portalLink ? ` Se precisar, o Portal do Aluno também está disponível: ${portalLink}` : ''}`;
        await this.whatsapp.enviarTexto(telefone, mensagem);
        return mensagem;
      }

      abertos.sort((a, b) =>
        parseDateBR(a.dataVencimento.substring(0, 10)).getTime() -
        parseDateBR(b.dataVencimento.substring(0, 10)).getTime(),
      );
      const lanc = abertos[0];
      const venc = parseDateBR(lanc.dataVencimento.substring(0, 10)).toLocaleDateString('pt-BR');

      const partes = [`Segue o pagamento da sua mensalidade mais próxima (vencimento *${venc}*):`];
      if (lanc.codigoPix) partes.push(`\n*PIX Copia e Cola:*\n\`${lanc.codigoPix}\``);
      if (portalLink) partes.push(`\nVocê também pode acessar o Portal do Aluno Sophia: ${portalLink}`);
      const mensagem = partes.join('\n');

      await this.whatsapp.enviarTexto(telefone, mensagem);

      if (lanc.codigoPix) {
        try {
          const qrBuffer = await QRCode.toBuffer(lanc.codigoPix, { width: 260, margin: 1, type: 'png' });
          await this.whatsapp.enviarImagem(telefone, qrBuffer.toString('base64'), 'QR Code PIX');
        } catch (err: unknown) {
          this.logger.warn(`enviarPixOuPortal: falha ao gerar/enviar QR code pro telefone ${telefone}: ${errMsg(err)}`);
        }
      }

      return mensagem;
    } catch (err: unknown) {
      this.logger.warn(`enviarPixOuPortal: falha ao consultar Sophia pro aluno ${cliente.codigoSophia}: ${errMsg(err)}`);
      return enviarSoLink();
    }
  }

  /**
   * Casa o telefone que vem do webhook (formato bruto do WhatsApp) contra
   * telefoneResponsavel no cache, comparando só os últimos 8 dígitos --
   * robusto a diferenças de DDI/9º dígito entre o que a Sophia guardou e o
   * que o WhatsApp manda. Postgres puro (regexp_replace) porque TypeORM não
   * tem um jeito portável de normalizar dígitos direto na query.
   */
  private async buscarClientesPorTelefone(telefoneWebhook: string): Promise<ClienteCache[]> {
    const digitos = telefoneWebhook.replace(/\D/g, '');
    const sufixo = digitos.slice(-8);
    if (sufixo.length < 8) return [];

    return this.clienteRepo
      .createQueryBuilder('c')
      .where(`regexp_replace(c."telefoneResponsavel", '\\D', '', 'g') LIKE :sufixo`, { sufixo: `%${sufixo}` })
      .andWhere('c.codigoSophia IS NOT NULL')
      .getMany();
  }

  /**
   * Manda com lista de opções nativa quando há opções coletadas. Se o
   * send-option-list falhar, cai pra texto puro com as opções como bullet
   * list, pra garantir que a mensagem chegue de algum jeito.
   */
  private async enviar(
    telefone: string,
    texto: string,
    opcoes: OpcaoLista[],
  ): Promise<void> {
    if (opcoes.length > 0) {
      try {
        await this.whatsapp.enviarListaOpcoes(
          telefone,
          texto,
          'O que deseja fazer?',
          'Ver opções',
          opcoes,
        );
        return;
      } catch (err: unknown) {
        this.logger.warn(
          `Lista falhou para ${telefone}, caindo pra texto puro — ${errMsg(err)}`,
        );
      }
      const textoComOpcoes = `${texto}\n\n${opcoes.map((o) => `• ${o.title}`).join('\n')}`;
      await this.whatsapp.enviarTexto(telefone, textoComOpcoes);
      return;
    }
    await this.whatsapp.enviarTexto(telefone, texto);
  }
}
