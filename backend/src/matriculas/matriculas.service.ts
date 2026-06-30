import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { SophiaService } from '../sophia/sophia.service';
import { EmailService } from '../email/email.service';
import { WhatsAppService } from '../email/whatsapp.service';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { MatriculaCache } from './entities/matricula-cache.entity';
import { SolicitarMatriculaDto } from './dto/solicitar-matricula.dto';
import { emailRelatorioMatricula, emailConfirmacaoMatricula } from '../email/templates/email.templates';

@Injectable()
export class MatriculasService {
  private readonly logger = new Logger(MatriculasService.name);

  constructor(
    @InjectRepository(MatriculaCache)
    private readonly cacheRepo: Repository<MatriculaCache>,
    private readonly sophia: SophiaService,
    private readonly email: EmailService,
    private readonly whatsapp: WhatsAppService,
    private readonly mp: MercadoPagoService,
    private readonly config: ConfigService,
  ) {}

  async solicitarMatricula(dto: SolicitarMatriculaDto) {
    // 1. Cria aluno no Sophia
    let clienteResult: unknown;
    try {
      clienteResult = await this.sophia.criarCliente({
        nome: dto.aluno.nome,
        cpf: dto.aluno.cpf,
        email: dto.aluno.email,
        telefone: dto.aluno.telefone,
        sexo: dto.aluno.sexo,
        dataNascimento: dto.aluno.dataNascimento,
        observacao: dto.observacao,
      });
    } catch (err: any) {
      const detalhe = err?.response?.data ?? err?.message;
      this.logger.error(`criarCliente falhou: ${JSON.stringify(detalhe)}`);
      throw new BadRequestException('Erro ao criar aluno no sistema. Verifique os dados e tente novamente.');
    }

    const codigoAluno = (clienteResult as { codigo?: number })?.codigo;
    if (!codigoAluno) {
      this.logger.error(`criarCliente não retornou codigo: ${JSON.stringify(clienteResult)}`);
      throw new BadRequestException('Sistema não retornou código do aluno. Contate o suporte.');
    }
    this.logger.log(`Aluno criado no Sophia: código ${codigoAluno}`);

    // 2. Cria e vincula responsável financeiro (se informado)
    let codigoResponsavel: number | undefined;
    if (dto.responsavel) {
      try {
        const respResult = await this.sophia.criarResponsavelAluno(codigoAluno, {
          nome: dto.responsavel.nome,
          cpf: dto.responsavel.cpf,
          email: dto.responsavel.email,
          telefone: dto.responsavel.telefone,
          responsavelFinanceiro: true,
          responsavelPedagogico: false,
          tipoVinculo: dto.responsavel.tipoParentesco
            ? { tipoParentesco: dto.responsavel.tipoParentesco }
            : undefined,
        });
        codigoResponsavel = respResult.codigo;
        await this.sophia.vincularResponsavelFinanceiro(codigoAluno, codigoResponsavel);
        this.logger.log(`Responsável ${codigoResponsavel} vinculado ao aluno ${codigoAluno}`);
      } catch (err: any) {
        // Não bloqueia o fluxo — financeiro receberá os dados pelo email e faz o vínculo manualmente
        this.logger.error(`criarResponsavel falhou (não-fatal): ${JSON.stringify(err?.response?.data ?? err?.message)}`);
      }
    }

    // 3. Cria matrícula no Sophia
    let matriculaResult: unknown;
    try {
      matriculaResult = await this.sophia.matricularAluno(codigoAluno, {
        unidade: dto.curso.unidade,
        curso: dto.curso.curso,
        turno: dto.curso.turno,
        periodoLetivo: dto.curso.periodoLetivo,
        curriculo: dto.curso.curriculo,
      });
    } catch (err: any) {
      const detalhe = err?.response?.data ?? err?.message;
      this.logger.error(`matricularAluno falhou: ${JSON.stringify(detalhe)}`);
      throw new BadRequestException('Erro ao registrar matrícula no sistema.');
    }
    this.logger.log(`Matrícula criada no Sophia: aluno ${codigoAluno}, curso ${dto.curso.curso}`);

    // 4. Notifica equipe financeira por email
    const emailFinanceiro = this.config.get<string>('email.emailNotificacoes');
    if (emailFinanceiro) {
      try {
        const html = emailRelatorioMatricula({
          nomeAluno: dto.aluno.nome,
          cpfAluno: dto.aluno.cpf,
          emailAluno: dto.aluno.email,
          telefoneAluno: dto.aluno.telefone,
          nomeResponsavel: dto.responsavel?.nome,
          cpfResponsavel: dto.responsavel?.cpf,
          emailResponsavel: dto.responsavel?.email,
          telefoneResponsavel: dto.responsavel?.telefone,
          curso: dto.curso.curso,
          unidade: dto.curso.unidade,
          turno: dto.curso.turno,
          periodoLetivo: dto.curso.periodoLetivo,
          numeroParcelas: dto.planoPagamento.numeroParcelas,
          valorParcela: dto.planoPagamento.valorParcela,
          dataPrimeiraParcela: dto.planoPagamento.dataPrimeiraParcela,
          desconto: dto.planoPagamento.desconto,
          codigoAluno,
          dataMatricula: new Date().toLocaleDateString('pt-BR'),
          nomeEscola: this.config.get<string>('email.nomeEscola') ?? 'IPESSP',
        });
        await this.email.enviar(
          emailFinanceiro,
          `Nova Matrícula — ${dto.aluno.nome} | ${dto.curso.curso}`,
          html,
        );
        this.logger.log(`Email de nova matrícula enviado ao financeiro: ${emailFinanceiro}`);
      } catch (err: any) {
        this.logger.error(`Falha ao enviar email ao financeiro (não-fatal): ${err.message}`);
      }
    }

    // 5. Gera preferência de pagamento no Mercado Pago (1ª parcela)
    const pagador = dto.responsavel ?? dto.aluno;
    const externalReference = `matricula-${codigoAluno}-${Date.now()}`;
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
      this.logger.log(`Preferência MP criada para aluno ${codigoAluno}: ${preferenceId}`);
    } catch (err: any) {
      this.logger.error(`MP criarPreferencia falhou (não-fatal): ${err.message}`);
    }

    // 6. Persiste dados da matrícula no cache local (para enriquecer o webhook de pagamento)
    if (linkPagamento) {
      try {
        await this.cacheRepo.save(this.cacheRepo.create({
          externalReference,
          codigoAluno,
          nomeAluno: dto.aluno.nome,
          emailAluno: dto.aluno.email,
          telefoneAluno: dto.aluno.telefone,
          nomeResponsavel: dto.responsavel?.nome,
          emailResponsavel: dto.responsavel?.email,
          telefoneResponsavel: dto.responsavel?.telefone,
          curso: dto.curso.curso,
          unidade: dto.curso.unidade,
          numeroParcelas: dto.planoPagamento.numeroParcelas,
          valorParcela: dto.planoPagamento.valorParcela,
          linkPagamento,
        }));
      } catch (err: any) {
        this.logger.warn(`Falha ao salvar MatriculaCache (não-fatal): ${err.message}`);
      }
    }

    // 7. Envia link de pagamento ao aluno/responsável
    if (linkPagamento) {
      const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'IPESSP';
      const emailEscola = this.config.get<string>('email.emailNotificacoes') ?? '';
      const siteUrl = this.config.get<string>('mercadopago.successUrl');

      // 7a. WhatsApp para quem paga (responsável ou aluno)
      const telefonePagador = pagador.telefone;
      if (telefonePagador) {
        const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const msg = [
          `🎓 *Bem-vindo(a) ao ${nomeEscola}!*`,
          ``,
          `Olá, ${pagador.nome.split(' ')[0]}! Sua matrícula no curso de *${dto.curso.curso}* foi registrada.`,
          ``,
          `💳 *Pagamento da 1ª parcela:*`,
          `Valor: ${fmt(dto.planoPagamento.valorParcela)}`,
          `Plano: ${dto.planoPagamento.numeroParcelas}x de ${fmt(dto.planoPagamento.valorParcela)}`,
          ``,
          `🔗 *Link de pagamento (Mercado Pago):*`,
          linkPagamento,
          ``,
          `Você pode pagar com cartão, PIX ou boleto. Qualquer dúvida, estamos à disposição! 😊`,
        ].join('\n');
        try {
          await this.whatsapp.enviarTexto(telefonePagador, msg);
          this.logger.log(`WhatsApp com link MP enviado para ${telefonePagador}`);
        } catch (err: any) {
          this.logger.warn(`WhatsApp para aluno/responsável falhou (não-fatal): ${err.message}`);
        }
      }

      // 7b. Email para quem paga (responsável ou aluno)
      const emailPagador = pagador.email;
      if (emailPagador) {
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
            emailPagador,
            `Matrícula confirmada — ${dto.curso.curso} | Acesse seu link de pagamento`,
            html,
          );
          this.logger.log(`Email de confirmação com link MP enviado para ${emailPagador}`);
        } catch (err: any) {
          this.logger.warn(`Email para aluno/responsável falhou (não-fatal): ${err.message}`);
        }
      }
    }

    return {
      ok: true,
      codigoAluno,
      codigoResponsavel: codigoResponsavel ?? null,
      matricula: matriculaResult,
      pagamento: {
        preferenceId,
        linkPagamento,
        linkSandbox,
      },
      mensagem: 'Matrícula registrada com sucesso. O setor financeiro foi notificado.',
    };
  }
}
