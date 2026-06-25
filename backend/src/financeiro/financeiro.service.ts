import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClienteCache } from './entities/cliente-cache.entity';
import { LancamentoCache } from './entities/lancamento-cache.entity';

export interface PendenciaFinanceira {
  codigo: number;
  descricao: string;
  vencimento: string;
  valor: number;
  diasAtraso: number;
  linhaDigitavel?: string;
  urlBoleto?: string;
  codigoPix?: string;
  competencia?: string;
}

export interface FinanceiroCliente {
  nomeAluno: string;
  nomeResponsavel: string;
  emailResponsavel: string;
  ra?: string;
  pendencias: PendenciaFinanceira[];
}

function parseDateBR(s: string): Date {
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) {
    const [d, m, y] = s.split('/');
    return new Date(+y, +m - 1, +d);
  }
  return new Date(s);
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
        where: { codigoCliente: cliente.id, recebido: 0 },
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

  async getLancamentosPendentes(): Promise<{ cliente: ClienteCache; lancamento: LancamentoCache }[]> {
    const lancamentos = await this.lancamentoRepo.find({ where: { recebido: 0 } });
    const resultado: { cliente: ClienteCache; lancamento: LancamentoCache }[] = [];
    for (const lanc of lancamentos) {
      const cliente = await this.clienteRepo.findOne({ where: { id: lanc.codigoCliente } });
      if (cliente) {
        resultado.push({ cliente, lancamento: lanc });
      }
    }
    return resultado;
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
      { recebido: 1 },
    );
  }

  async stats(): Promise<{ clientes: number; lancamentosPendentes: number; lancamentosTotal: number }> {
    const [clientes, lancamentosPendentes, lancamentosTotal] = await Promise.all([
      this.clienteRepo.count(),
      this.lancamentoRepo.count({ where: { recebido: 0 } }),
      this.lancamentoRepo.count(),
    ]);
    return { clientes, lancamentosPendentes, lancamentosTotal };
  }
}
