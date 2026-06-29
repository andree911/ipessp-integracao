import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SophiaService } from '../sophia/sophia.service';
import { EmailService } from '../email/email.service';
import { MercadoPagoService } from '../mercadopago/mercadopago.service';
import { SolicitarMatriculaDto } from './dto/solicitar-matricula.dto';
import { emailRelatorioMatricula } from '../email/templates/email.templates';

@Injectable()
export class MatriculasService {
  private readonly logger = new Logger(MatriculasService.name);

  constructor(
    private readonly sophia: SophiaService,
    private readonly email: EmailService,
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
      // Registra apenas o vínculo acadêmico no Sophia.
      // O financeiro configura o plano de pagamento manualmente via relatório;
      // a primeira cobrança é gerada pelo Mercado Pago (próximo passo).
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
    let linkPagamento: string | null = null;
    let linkSandbox: string | null = null;
    let preferenceId: string | null = null;
    try {
      const mpResult = await this.mp.criarPreferencia({
        titulo: `Matrícula — ${dto.curso.curso} — 1ª Parcela`,
        valorParcela: dto.planoPagamento.valorParcela,
        numeroParcelas: dto.planoPagamento.numeroParcelas,
        referenciaExterna: `matricula-${codigoAluno}-${Date.now()}`,
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
