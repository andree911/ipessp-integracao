import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { errMsg } from '../common/err.util';
import { WhatsAppService } from '../email/whatsapp.service';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { MatriculaCache } from './entities/matricula-cache.entity';
import { SolicitarMatriculaDto } from './dto/solicitar-matricula.dto';
import { emailConfirmacaoMatricula } from '../email/templates/email.templates';

@Injectable()
export class MatriculasService {
  private readonly logger = new Logger(MatriculasService.name);

  constructor(
    @InjectRepository(MatriculaCache)
    private readonly cacheRepo: Repository<MatriculaCache>,
    private readonly email: EmailService,
    private readonly whatsapp: WhatsAppService,
    private readonly mp: MercadoPagoService,
    private readonly config: ConfigService,
  ) {}

  async solicitarMatricula(dto: SolicitarMatriculaDto) {
    const pagador = dto.responsavel ?? dto.aluno;
    const externalReference = `matricula-${dto.aluno.cpf.replace(/\D/g, '')}-${Date.now()}`;

    // 1. Gera preferência de pagamento no Mercado Pago
    let linkPagamento: string | null = null;
    let linkSandbox: string | null = null;
    let preferenceId: string | null = null;

    try {
      const mpResult = await this.mp.criarPreferencia({
        titulo: `Matrícula — ${dto.curso.curso} — 1ª Parcela`,
        valorParcela: dto.planoPagamento.valorParcela,
        numeroParcelas: dto.planoPagamento.numeroParcelas,
        referenciaExterna: externalReference,
        pagador: {
          nome: pagador.nome,
          email: pagador.email,
          cpf: pagador.cpf,
          telefone: pagador.telefone,
        },
      });
      linkPagamento = mpResult.linkPagamento;
      linkSandbox = mpResult.linkSandbox;
      preferenceId = mpResult.preferenceId;
      this.logger.log(`Preferência MP criada: ${preferenceId} ref=${externalReference}`);
    } catch (err: unknown) {
      this.logger.error(`MP criarPreferencia falhou: ${errMsg(err)}`);
      throw new BadRequestException('Não foi possível gerar o link de pagamento. Tente novamente.');
    }

    // 2. Persiste todos os dados no cache para uso no webhook
    try {
      await this.cacheRepo.save(this.cacheRepo.create({
        externalReference,
        preferenceId,
        nomeAluno: dto.aluno.nome,
        cpfAluno: dto.aluno.cpf,
        emailAluno: dto.aluno.email,
        telefoneAluno: dto.aluno.telefone,
        sexoAluno: dto.aluno.sexo,
        dataNascimentoAluno: dto.aluno.dataNascimento,
        nomeResponsavel: dto.responsavel?.nome,
        cpfResponsavel: dto.responsavel?.cpf,
        emailResponsavel: dto.responsavel?.email,
        telefoneResponsavel: dto.responsavel?.telefone,
        unidade: dto.curso.unidade,
        curso: dto.curso.curso,
        turno: dto.curso.turno,
        periodoLetivo: dto.curso.periodoLetivo,
        curriculo: dto.curso.curriculo,
        numeroParcelas: dto.planoPagamento.numeroParcelas,
        valorParcela: dto.planoPagamento.valorParcela,
        dataPrimeiraParcela: dto.planoPagamento.dataPrimeiraParcela,
        desconto: dto.planoPagamento.desconto,
        linkPagamento,
      }));
    } catch (err: unknown) {
      this.logger.warn(`Falha ao salvar MatriculaCache (não-fatal): ${errMsg(err)}`);
    }

    // 3. Envia link de pagamento ao aluno/responsável via WhatsApp
    if (pagador.telefone) {
      const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
      const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'IPESSP';
      const msg = [
        `🎓 *Bem-vindo(a) ao ${nomeEscola}!*`,
        ``,
        `Olá, ${pagador.nome.split(' ')[0]}! Sua solicitação de matrícula no curso de *${dto.curso.curso}* foi recebida.`,
        ``,
        `💳 *Pagamento da 1ª parcela:*`,
        `Plano: ${dto.planoPagamento.numeroParcelas}x de ${fmt(dto.planoPagamento.valorParcela)}`,
        ``,
        `🔗 *Link de pagamento (Mercado Pago):*`,
        linkPagamento,
        ``,
        `Você pode pagar com cartão, PIX ou boleto. Após a confirmação do pagamento, nossa equipe finalizará sua matrícula. Qualquer dúvida, estamos à disposição! 😊`,
      ].join('\n');
      try {
        await this.whatsapp.enviarTexto(pagador.telefone, msg);
        this.logger.log(`WhatsApp com link MP enviado para ${pagador.telefone}`);
      } catch (err: unknown) {
        this.logger.warn(`WhatsApp para aluno/responsável falhou (não-fatal): ${errMsg(err)}`);
      }
    }

    // 4. Envia link de pagamento ao aluno/responsável via email
    if (pagador.email) {
      const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'IPESSP';
      const emailEscola = this.config.get<string>('email.emailNotificacoes') ?? '';
      const siteUrl = this.config.get<string>('mercadopago.successUrl');
      try {
        const html = emailConfirmacaoMatricula({
          nomeAluno: dto.aluno.nome,
          curso: dto.curso.curso,
          numeroParcelas: dto.planoPagamento.numeroParcelas,
          valorParcela: dto.planoPagamento.valorParcela,
          linkPagamento,
          nomeEscola,
          emailEscola,
          siteUrl,
        });
        await this.email.enviar(
          pagador.email,
          `Sua matrícula em ${dto.curso.curso} — Acesse o link de pagamento`,
          html,
        );
        this.logger.log(`Email com link MP enviado para ${pagador.email}`);
      } catch (err: unknown) {
        this.logger.warn(`Email para aluno/responsável falhou (não-fatal): ${errMsg(err)}`);
      }
    }

    return {
      ok: true,
      pagamento: {
        preferenceId,
        linkPagamento,
        linkSandbox,
      },
      mensagem: 'Link de pagamento gerado com sucesso. O aluno/responsável foi notificado.',
    };
  }
}
