import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { errMsg } from '../common/err.util';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { WhatsAppService } from './whatsapp.service';
import { EmailLog, EmailTipo } from './entities/email-log.entity';
import { parseDateBR } from '../common/date.util';

const WPP_ANTES_TIPO: Record<number, EmailTipo> = {
  7: 'wpp_antes_7', 5: 'wpp_antes_5', 3: 'wpp_antes_3', 1: 'wpp_antes_1',
};
const WPP_APOS_TIPO: Record<number, EmailTipo> = {
  1: 'wpp_apos_1',   2: 'wpp_apos_2',  3: 'wpp_apos_3',  7: 'wpp_apos_7',
  8: 'wpp_apos_8',   9: 'wpp_apos_9',  10: 'wpp_apos_10', 12: 'wpp_apos_12',
  15: 'wpp_apos_15', 20: 'wpp_apos_20',
};

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
  ) {}

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
      return `Oi, ${nome}! 👋\nPassando para lembrar que sua mensalidade com vencimento em *${venc}* já está disponível para pagamento.\nVocê pode pagar via PIX copia e cola ou pelo Portal do Aluno Sophia, onde também consegue emitir a 2ª via do boleto quando quiser.${pixBloco}\nAproveite para se antecipar e evitar imprevistos de última hora! 😉${cta('Acessar Portal Sophia')}`;
    }
    if (diffDias === 5) {
      return `Olá, ${nome}!\nSua mensalidade vence em 5 dias (*${venc}*). Já está disponível para pagamento via PIX ou boleto, e também pelo Portal Sophia.${pixBloco}\nQue tal já deixar essa pendência resolvida? Assim você garante que tudo fique em dia sem se preocupar depois. 🙂${quickReply('Já paguei', 'Preciso de ajuda')}`;
    }
    if (diffDias === 3) {
      return `${nome}, tudo bem?\nSua mensalidade vence em apenas 3 dias (*${venc}*). Para evitar juros e encargos por atraso, recomendamos realizar o pagamento o quanto antes.${pixBloco}\nO boleto também está disponível no Portal do Aluno Sophia, caso prefira pagar por lá.${cta('Pagar no Portal Sophia')}`;
    }
    if (diffDias === 1) {
      return `Atenção, ${nome}! 🚨\nSua mensalidade vence amanhã (*${venc}*). Para evitar a incidência de juros, o ideal é regularizar ainda hoje.${pixBloco}\nSe já efetuou o pagamento, pode desconsiderar esta mensagem. Qualquer dúvida, estamos por aqui!${quickReply('Já paguei', 'Quero negociar')}`;
    }

    // ── No dia do vencimento ─────────────────────────────────────────────────
    if (diffDias === 0) {
      return `${nome}! 📅\nO vencimento da sua mensalidade é hoje (*${venc}*). Este é o último dia para realizar o pagamento sem acréscimo de juros e encargos.${pixBloco}\nVocê também pode pagar diretamente pelo Portal do Aluno Sophia, de forma rápida e segura.${cta('Pagar agora')}`;
    }

    // ── Após o vencimento ────────────────────────────────────────────────────
    const atraso = Math.abs(diffDias);

    if (atraso === 1) {
      return `Oi, ${nome}.\nNotamos que sua mensalidade com vencimento em *${venc}* não foi identificada em nosso sistema até o momento.\nPara evitar o acréscimo de juros e encargos, pedimos que regularize o quanto antes.${pixBloco}\nSe já efetuou o pagamento, pode desconsiderar esta mensagem. 🙂${cta('Pagar agora')}`;
    }
    if (atraso === 2) {
      return `Olá, ${nome}.\nSua mensalidade com vencimento em *${venc}* segue em aberto há 2 dias.\nPara evitar maiores encargos, recomendamos a regularização o quanto antes.${pixBloco}\nVocê também pode acessar o Portal Sophia para consultar e pagar diretamente por lá.${cta('Pagar no Portal')}`;
    }
    if (atraso === 3) {
      return `${nome}, tudo bem?\nIdentificamos que sua mensalidade está em aberto há 3 dias. Pedimos, por gentileza, que regularize o pagamento para evitar juros adicionais.${pixBloco}\nSe precisar de ajuda ou já pagou, é só nos avisar por aqui!${quickReply('Já paguei', 'Falar com o financeiro')}`;
    }
    if (atraso === 7) {
      return `Olá, ${nome}.\nSua mensalidade encontra-se em aberto há 7 dias. Reforçamos a importância da regularização para evitar o acréscimo de encargos e possíveis restrições acadêmicas.${pixBloco}\nVocê pode consultar e pagar também pelo Portal Sophia.${cta('Acessar Portal Sophia')}`;
    }
    if (atraso === 8) {
      return `Oi, ${nome}.\nSua mensalidade segue pendente há 8 dias. Para evitar transtornos, pedimos que a regularização seja feita o quanto antes.${pixBloco}\nEstamos à disposição para ajudar com o que for preciso!${quickReply('Já paguei', 'Preciso de ajuda')}`;
    }
    if (atraso === 9) {
      return `${nome}, sua mensalidade está em aberto há 9 dias.\nPara evitar o aumento dos juros e encargos contratuais, solicitamos a regularização com urgência.${pixBloco}\nCaso já tenha pago, pode desconsiderar esta mensagem.${cta('Pagar agora')}`;
    }
    if (atraso === 10) {
      return `Atenção, ${nome}. 📌\nSua mensalidade está em atraso há 10 dias. A continuidade do débito pode gerar restrições acadêmicas, como bloqueio de acesso a notas e boletos.${pixBloco}\nPedimos a regularização o quanto antes para evitar maiores transtornos.${quickReply('Já paguei', 'Quero negociar')}`;
    }
    if (atraso === 12) {
      return `${nome}, sua mensalidade está vencida há 12 dias.\nSolicitamos, por gentileza, que a regularização seja realizada com urgência, a fim de evitar o acréscimo de juros e possíveis restrições acadêmicas.${pixBloco}\nCaso tenha alguma dificuldade, entre em contato para avaliarmos opções de negociação.${cta('Pagar no Portal Sophia')}`;
    }
    if (atraso === 15) {
      return `Olá, ${nome}.\nSua mensalidade está em aberto há 15 dias, já sujeita ao acréscimo de juros e encargos contratuais.\nPedimos que a quitação seja providenciada o quanto antes.${pixBloco}\nSe desejar negociar valores ou condições, é só nos chamar por aqui.${quickReply('Já paguei', 'Falar com o financeiro')}`;
    }
    if (atraso === 20) {
      return `${nome}, atenção: sua mensalidade está em atraso há 20 dias. ⚠️\nA manutenção do débito pode acarretar restrições acadêmicas, incluindo bloqueio de acesso a notas, boletos e matrícula.${pixBloco}\nPedimos a regularização imediata. Caso tenha dificuldades para o pagamento, entre em contato para negociarmos juntos a melhor solução.${cta('Resolver no Portal Sophia')}`;
    }

    // ── Fallback para dias não mapeados ──────────────────────────────────────
    if (diffDias > 0) {
      return `📅 Olá, ${nome}!\nSua mensalidade vence em *${diffDias} dia(s)* (*${venc}*). Efetue o pagamento em dia para evitar juros e encargos.${pixBloco}${cta('Acessar Portal Sophia')}`;
    }
    return `⚠️ Olá, ${nome}!\nSua mensalidade está em aberto há *${atraso} dia(s)* (venceu em *${venc}*). Regularize o quanto antes para evitar maiores encargos.${pixBloco}${cta('Acessar Portal')}`;
  }

  @Cron('0 8 * * *', { name: 'wpp_job' })
  async runWhatsAppJob(): Promise<void> {
    if (this.config.get<string>('zapi.cronHabilitado') !== 'true') {
      this.logger.warn('Job de WhatsApp desabilitado (WPP_CRON_HABILITADO=false)');
      return;
    }

    this.logger.log('=== Iniciando job de WhatsApp ===');

    const diasAntes: number[] = this.config.get<number[]>('zapi.diasAntes') ?? [7, 5, 3, 1];
    const diasApos: number[]  = this.config.get<number[]>('zapi.diasApos')  ?? [1, 2, 3, 7, 8, 9, 10, 12, 15, 20];
    const portalLink =
      this.config.get<string>('email.linkPortalAluno') ||
      this.config.get<string>('email.siteUrl') ||
      undefined;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const BATCH_LIMIT = 500;
    const pendentes = (await this.financeiro.getLancamentosPendentes()).slice(0, BATCH_LIMIT);
    let totalEnviados = 0;
    let totalErros = 0;

    for (const { cliente, lancamento } of pendentes) {
      if (!cliente.telefoneResponsavel) continue;

      try {
        const venc = parseDateBR(lancamento.dataVencimento);
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

        const jaEnviado = await this.logRepo.findOne({
          where: { codigoLancamento: String(lancamento.id), tipo, enviado: true },
        });
        if (jaEnviado && new Date(jaEnviado.enviadoEm).toDateString() === hoje.toDateString()) continue;

        const mensagem = this.montarMensagem(diffDias, {
          nomeResponsavel: cliente.nomeResponsavel ?? cliente.nomeAluno,
          nomeAluno: cliente.nomeAluno,
          vencimento: venc.toLocaleDateString('pt-BR'),
          codigoPix: lancamento.codigoPix ?? undefined,
          portalLink,
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
        } catch (err: unknown) {
          log.erro = errMsg(err);
          totalErros++;
          this.logger.error(`Erro WhatsApp ${cliente.telefoneResponsavel}: ${errMsg(err)}`);
        }

        await this.logRepo.save(log);
      } catch (err: unknown) {
        this.logger.error(`Erro ao processar lançamento ${lancamento.id}: ${errMsg(err)}`);
      }
    }

    this.logger.log(`=== Job WhatsApp concluído: ${totalEnviados} enviados, ${totalErros} erros ===`);
  }
}
