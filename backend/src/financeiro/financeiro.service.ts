import { Injectable, NotFoundException } from '@nestjs/common';
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

@Injectable()
export class FinanceiroService {
  constructor(
    @InjectRepository(ClienteCache)
    private readonly clienteRepo: Repository<ClienteCache>,
    @InjectRepository(LancamentoCache)
    private readonly lancamentoRepo: Repository<LancamentoCache>,
  ) {}

  async getByCpf(cpf: string): Promise<FinanceiroCliente> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const clientes = await this.clienteRepo.find({ where: { cpf: cpfLimpo } });
    if (clientes.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado. Verifique se o CPF do responsável financeiro está cadastrado.',
      );
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pendencias: PendenciaFinanceira[] = [];
    for (const cliente of clientes) {
      const lancamentos = await this.lancamentoRepo.find({
        where: { codigoCliente: cliente.id, recebido: false },
      });
      for (const l of lancamentos) {
        const venc = parseDateBR(l.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((hoje.getTime() - venc.getTime()) / 86_400_000);
        pendencias.push({
          codigo: l.id,
          descricao: l.descricao ?? 'Mensalidade',
          vencimento: l.dataVencimento.substring(0, 10),
          valor: Number(l.valorPrevisto),
          diasAtraso: diffDias > 0 ? diffDias : 0,
          linhaDigitavel: l.linhaDigitavel ?? undefined,
          urlBoleto: l.urlBoleto ?? undefined,
          codigoPix: l.codigoPix ?? undefined,
          codigoBoleto: l.codigoBoleto ?? undefined,
          competencia: l.competencia ?? undefined,
        });
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

  /** Mesma lógica de getByCpf, mas buscando pelo codigoSophia do aluno (usado pelo Portal do Aluno, que já tem esse código pela sessão logada). */
  async getByCodigoSophia(codigoSophia: number): Promise<FinanceiroCliente> {
    const clientes = await this.clienteRepo.find({ where: { codigoSophia } });
    if (clientes.length === 0) {
      throw new NotFoundException('Nenhum registro financeiro encontrado para este aluno.');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const pendencias: PendenciaFinanceira[] = [];
    for (const cliente of clientes) {
      const lancamentos = await this.lancamentoRepo.find({
        where: { codigoCliente: cliente.id, recebido: false },
      });
      for (const l of lancamentos) {
        const venc = parseDateBR(l.dataVencimento);
        venc.setHours(0, 0, 0, 0);
        const diffDias = Math.round((hoje.getTime() - venc.getTime()) / 86_400_000);
        pendencias.push({
          codigo: l.id,
          descricao: l.descricao ?? 'Mensalidade',
          vencimento: l.dataVencimento.substring(0, 10),
          valor: Number(l.valorPrevisto),
          diasAtraso: diffDias > 0 ? diffDias : 0,
          linhaDigitavel: l.linhaDigitavel ?? undefined,
          urlBoleto: l.urlBoleto ?? undefined,
          codigoPix: l.codigoPix ?? undefined,
          codigoBoleto: l.codigoBoleto ?? undefined,
          competencia: l.competencia ?? undefined,
        });
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

  /**
   * Confirma que o boleto pertence a um cliente com esse CPF e devolve o
   * código do aluno no Sophia (necessário pra baixar o PDF via API).
   */
  async getBoletoInfo(cpf: string, codigoBoleto: number): Promise<{ codigoAluno: number }> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    const clientes = await this.clienteRepo.find({ where: { cpf: cpfLimpo } });
    if (clientes.length === 0) {
      throw new NotFoundException('Nenhum aluno encontrado para o CPF informado.');
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

  async getLancamentosPendentes(): Promise<{ cliente: ClienteCache; lancamento: LancamentoCache }[]> {
    const lancamentos = await this.lancamentoRepo.find({ where: { recebido: false } });
    if (lancamentos.length === 0) return [];
    const ids = [...new Set(lancamentos.map(l => l.codigoCliente))];
    const clientes = await this.clienteRepo.findBy({ id: In(ids) });
    const mapaClientes = new Map(clientes.map(c => [c.id, c]));
    return lancamentos
      .map(lancamento => ({ cliente: mapaClientes.get(lancamento.codigoCliente), lancamento }))
      .filter((r): r is { cliente: ClienteCache; lancamento: LancamentoCache } => r.cliente !== undefined);
  }

  async upsertCliente(dados: Partial<ClienteCache>): Promise<ClienteCache> {
    const existing = dados.codigoSophia
      ? await this.clienteRepo.findOne({ where: { codigoSophia: dados.codigoSophia } })
      : null;

    if (existing) {
      await this.clienteRepo.update(existing.id, dados);
      return { ...existing, ...dados } as ClienteCache;
    }

    return this.clienteRepo.save(this.clienteRepo.create(dados));
  }

  async upsertLancamento(dados: Partial<LancamentoCache>): Promise<void> {
    if (dados.codigoSophia && dados.codigoCliente) {
      await this.lancamentoRepo.upsert(dados as LancamentoCache, ['codigoSophia', 'codigoCliente']);
    } else {
      await this.lancamentoRepo.save(this.lancamentoRepo.create(dados));
    }
  }

  async marcarRecebido(codigoSophia: number, codigoCliente: number): Promise<void> {
    await this.lancamentoRepo.update(
      { codigoSophia, codigoCliente },
      { recebido: true },
    );
  }

  async stats(): Promise<{ clientes: number; lancamentosPendentes: number; lancamentosTotal: number }> {
    const [clientes, lancamentosPendentes, lancamentosTotal] = await Promise.all([
      this.clienteRepo.count(),
      this.lancamentoRepo.count({ where: { recebido: false } }),
      this.lancamentoRepo.count(),
    ]);
    return { clientes, lancamentosPendentes, lancamentosTotal };
  }
}
