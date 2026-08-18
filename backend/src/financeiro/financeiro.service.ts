import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { ClienteCache } from './entities/cliente-cache.entity';
import { LancamentoCache } from './entities/lancamento-cache.entity';
import { parseDateBR } from '../common/date.util';

export interface PendenciaFinanceira {
  codigo: number;
  descricao: string;
  vencimento: string;
  valor: number;
  diasAtraso: number;
  linhaDigitavel?: string;
  urlBoleto?: string;
  codigoPix?: string;
  codigoBoleto?: number;
  competencia?: string;
}

export interface FinanceiroCliente {
  nomeAluno: string;
  nomeResponsavel: string;
  emailResponsavel: string | null;
  ra?: string;
  pendencias: PendenciaFinanceira[];
}

export interface ResultadoBuscaAluno {
  id: number;
  nomeAluno: string;
  ra: string | null;
  cpf: string | null;
}

export interface ResumoCancelamento {
  nomeAluno: string;
  ra: string;
  emailResponsavel: string | null;
  valorParcela: number;
  parcelasEmAberto: number;
  somaValor: number;
  parcelasEmAtraso: number;
  saldoDevedor: number;
  valorMulta: number;
}

@Injectable()
export class FinanceiroService {
  private readonly logger = new Logger(FinanceiroService.name);

  constructor(
    @InjectRepository(ClienteCache)
    private readonly clienteRepo: Repository<ClienteCache>,
    @InjectRepository(LancamentoCache)
    private readonly lancamentoRepo: Repository<LancamentoCache>,
  ) {}

  /** Diagnóstico: codigoSophia de todo cliente já sincronizado no cache local. */
  async getCodigosSophiaCache(): Promise<Set<number>> {
    const clientes = await this.clienteRepo.find({
      select: { codigoSophia: true },
    });
    return new Set(
      clientes.map((c) => c.codigoSophia).filter((c): c is number => c != null),
    );
  }

  async getByCpf(cpf: string): Promise<FinanceiroCliente> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const clientes = await this.clienteRepo.find({ where: { cpf: cpfLimpo } });
    if (clientes.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado. Verifique se o CPF do responsável financeiro está cadastrado.',
      );
    }
    return this.montarFinanceiroCliente(clientes);
  }

  /** Mesma lógica de getByCpf, mas buscando pelo codigoSophia do aluno (usado pelo Portal do Aluno, que já tem esse código pela sessão logada). */
  async getByCodigoSophia(codigoSophia: number): Promise<FinanceiroCliente> {
    const clientes = await this.clienteRepo.find({ where: { codigoSophia } });
    if (clientes.length === 0) {
      throw new NotFoundException(
        'Nenhum registro financeiro encontrado para este aluno.',
      );
    }
    return this.montarFinanceiroCliente(clientes);
  }

  /**
   * Monta o retorno agregado de getByCpf/getByCodigoSophia: uma única query
   * em lote pra todos os lançamentos dos clientes informados (em vez de uma
   * query por cliente dentro de um loop), e ignora lançamentos com data de
   * vencimento inválida em vez de derrubar a requisição inteira.
   */
  private async montarFinanceiroCliente(
    clientes: ClienteCache[],
  ): Promise<FinanceiroCliente> {
    const clienteIds = clientes.map((c) => c.id);
    const lancamentos = await this.lancamentoRepo.find({
      where: { codigoCliente: In(clienteIds), recebido: false },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const lancamentosPorCliente = new Map<number, LancamentoCache[]>();
    for (const l of lancamentos) {
      const lista = lancamentosPorCliente.get(l.codigoCliente) ?? [];
      lista.push(l);
      lancamentosPorCliente.set(l.codigoCliente, lista);
    }

    const pendencias: PendenciaFinanceira[] = [];
    for (const cliente of clientes) {
      for (const l of lancamentosPorCliente.get(cliente.id) ?? []) {
        const pendencia = this.montarPendencia(l, hoje);
        if (pendencia) pendencias.push(pendencia);
      }
    }

    const primeiro = clientes[0];
    return {
      nomeAluno: primeiro.nomeAluno,
      nomeResponsavel: primeiro.nomeResponsavel ?? primeiro.nomeAluno,
      emailResponsavel: primeiro.emailResponsavel,
      ra: primeiro.ra ?? String(primeiro.codigoSophia ?? primeiro.id),
      pendencias,
    };
  }

  private montarPendencia(
    l: LancamentoCache,
    hoje: Date,
  ): PendenciaFinanceira | undefined {
    const venc = parseDateBR(l.dataVencimento);
    if (Number.isNaN(venc.getTime())) {
      this.logger.warn(
        `Lançamento ${l.id}: data de vencimento inválida ("${l.dataVencimento}") — ignorado.`,
      );
      return undefined;
    }
    venc.setHours(0, 0, 0, 0);
    const diffDias = Math.round((hoje.getTime() - venc.getTime()) / 86_400_000);
    return {
      codigo: l.id,
      descricao: l.descricao ?? 'Mensalidade',
      vencimento: venc.toISOString().substring(0, 10),
      valor: l.valorPrevisto,
      diasAtraso: diffDias > 0 ? diffDias : 0,
      linhaDigitavel: l.linhaDigitavel ?? undefined,
      urlBoleto: l.urlBoleto ?? undefined,
      codigoPix: l.codigoPix ?? undefined,
      codigoBoleto: l.codigoBoleto ?? undefined,
      competencia: l.competencia ?? undefined,
    };
  }

  /**
   * Confirma que o boleto pertence a um cliente com esse CPF e devolve o
   * código do aluno no Sophia (necessário pra baixar o PDF via API).
   */
  async getBoletoInfo(
    cpf: string,
    codigoBoleto: number,
  ): Promise<{ codigoAluno: number }> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const clientes = await this.clienteRepo.find({ where: { cpf: cpfLimpo } });
    if (clientes.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado.',
      );
    }

    const clienteIds = clientes.map((c) => c.id);
    const lancamento = await this.lancamentoRepo.findOne({
      where: { codigoCliente: In(clienteIds), codigoBoleto },
    });
    if (!lancamento) {
      throw new NotFoundException('Boleto não encontrado para este CPF.');
    }

    const cliente = clientes.find((c) => c.id === lancamento.codigoCliente);
    if (!cliente?.codigoSophia) {
      throw new NotFoundException('Aluno sem código Sophia associado.');
    }

    return { codigoAluno: cliente.codigoSophia };
  }

  /** Busca alunos por nome (parcial) ou RA (parcial) — usado no autocomplete da tela de Cancelamentos. */
  async buscarAlunos(query: string): Promise<ResultadoBuscaAluno[]> {
    const termo = query.trim();
    if (!termo) return [];

    const clientes = await this.clienteRepo
      .createQueryBuilder('c')
      .where('c.nomeAluno LIKE :termo', { termo: `%${termo}%` })
      .orWhere('c.ra LIKE :termo', { termo: `%${termo}%` })
      .orderBy('c.nomeAluno', 'ASC')
      .take(20)
      .getMany();

    return clientes.map((c) => ({
      id: c.id,
      nomeAluno: c.nomeAluno,
      ra: c.ra,
      cpf: c.cpf,
    }));
  }

  /**
   * Resumo financeiro usado na tela de Cancelamentos. "Soma do Valor" inclui
   * TODAS as parcelas em aberto (futuras + em atraso) — é sobre esse total que
   * incide a multa rescisória de 10%. "Saldo Devedor" é o subconjunto das
   * parcelas já vencidas (inadimplência), cobrado à parte, além da multa.
   */
  async getResumoCancelamento(ra: string): Promise<ResumoCancelamento> {
    const cliente = await this.clienteRepo.findOne({ where: { ra } });
    if (!cliente) {
      throw new NotFoundException(`Nenhum aluno encontrado para o RA '${ra}'`);
    }

    const lancamentos = await this.lancamentoRepo.find({
      where: { codigoCliente: cliente.id, recebido: false },
    });

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    let somaValor = 0;
    let saldoDevedor = 0;
    let parcelasEmAtraso = 0;

    for (const l of lancamentos) {
      const valor = l.valorPrevisto;
      somaValor += valor;

      const venc = parseDateBR(l.dataVencimento);
      venc.setHours(0, 0, 0, 0);
      if (venc.getTime() < hoje.getTime()) {
        parcelasEmAtraso++;
        saldoDevedor += valor;
      }
    }

    const parcelasEmAberto = lancamentos.length;
    const valorParcela =
      parcelasEmAberto > 0 ? somaValor / parcelasEmAberto : 0;
    const arredondar = (v: number) => Math.round(v * 100) / 100;

    return {
      nomeAluno: cliente.nomeAluno,
      ra: cliente.ra ?? ra,
      emailResponsavel: cliente.emailResponsavel,
      valorParcela: arredondar(valorParcela),
      parcelasEmAberto,
      somaValor: arredondar(somaValor),
      parcelasEmAtraso,
      saldoDevedor: arredondar(saldoDevedor),
      valorMulta: arredondar(somaValor * 0.1),
    };
  }

  /**
   * Roster de alunos com e-mail cadastrado, pra uso do EmailJobService ao
   * consultar a Sophia ao vivo em vez de ler status de pagamento do cache.
   * Só usa o cache pra dado de CONTATO (nome/e-mail/codigoSophia) -- essa
   * parte não tem o risco de ficar "presa"/desatualizada que o status de
   * pagamento tinha (ver incidente de 2026-08-12): não muda com frequência
   * e, mesmo se mudar, o pior caso é não notificar alguém, não cobrar quem
   * já pagou.
   */
  async getClientesComEmail(): Promise<ClienteCache[]> {
    return this.clienteRepo
      .createQueryBuilder('c')
      .where('c.emailResponsavel IS NOT NULL')
      .andWhere("c.emailResponsavel != ''")
      .andWhere('c.codigoSophia IS NOT NULL')
      .getMany();
  }

  /** Mesmo roster de getClientesComEmail, mas pra WhatsAppJobService (telefone em vez de e-mail). */
  async getClientesComTelefone(): Promise<ClienteCache[]> {
    return this.clienteRepo
      .createQueryBuilder('c')
      .where('c.telefoneResponsavel IS NOT NULL')
      .andWhere("c.telefoneResponsavel != ''")
      .andWhere('c.codigoSophia IS NOT NULL')
      .getMany();
  }

  async upsertCliente(dados: Partial<ClienteCache>): Promise<ClienteCache> {
    const existing = dados.codigoSophia
      ? await this.clienteRepo.findOne({
          where: { codigoSophia: dados.codigoSophia },
        })
      : null;

    if (existing) {
      await this.clienteRepo.update(existing.id, dados);
      return { ...existing, ...dados };
    }

    return this.clienteRepo.save(this.clienteRepo.create(dados));
  }

  async upsertLancamento(dados: Partial<LancamentoCache>): Promise<void> {
    if (dados.codigoSophia && dados.codigoCliente) {
      await this.lancamentoRepo.upsert(dados, [
        'codigoSophia',
        'codigoCliente',
      ]);
    } else {
      await this.lancamentoRepo.save(this.lancamentoRepo.create(dados));
    }
  }

  async marcarRecebido(
    codigoSophia: number,
    codigoCliente: number,
  ): Promise<void> {
    await this.lancamentoRepo.update(
      { codigoSophia, codigoCliente },
      { recebido: true },
    );
  }

  /** Usado pela reconciliação de órfãos no ImportacaoService -- lançamentos em aberto de um único cliente. */
  async getLancamentosAbertosDoCliente(
    codigoCliente: number,
  ): Promise<LancamentoCache[]> {
    return this.lancamentoRepo.find({
      where: { codigoCliente, recebido: false },
    });
  }

  async stats(): Promise<{
    clientes: number;
    lancamentosPendentes: number;
    lancamentosTotal: number;
  }> {
    const [clientes, lancamentosPendentes, lancamentosTotal] =
      await Promise.all([
        this.clienteRepo.count(),
        this.lancamentoRepo.count({ where: { recebido: false } }),
        this.lancamentoRepo.count(),
      ]);
    return { clientes, lancamentosPendentes, lancamentosTotal };
  }
}
