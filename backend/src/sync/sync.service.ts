import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { RecivService } from '../receiv/receiv.service';
import { SyncEntityType, SyncLog } from './entities/sync-log.entity';
import { RecivCliente, RecivContrato, RecivTitulo, RecivBaixa } from '../receiv/types/receiv.types';
import {
  LancamentoAlunoApiModel,
  MatriculaAlunoApiModel,
  ResponsavelAlunoApiModel,
} from '../sophia/types/sophia.types';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private running = false;

  constructor(
    private readonly sophia: SophiaService,
    private readonly receiv: RecivService,
    private readonly config: ConfigService,
    @InjectRepository(SyncLog)
    private readonly syncLogRepo: Repository<SyncLog>,
  ) {}

  async triggerSync(): Promise<{ message: string }> {
    if (this.running) return { message: 'Sync já em andamento' };
    void this.runSync();
    return { message: 'Sync iniciado' };
  }

  @Cron('0 * * * *', { name: 'sync_job' })
  async runSync(): Promise<void> {
    if (this.running) {
      this.logger.warn('Sync já em andamento, pulando ciclo');
      return;
    }

    this.running = true;
    this.logger.log('=== Iniciando ciclo de sincronização ===');

    try {
      const lookbackDays = this.config.get<number>('sync.lookbackDays') ?? 30;
      const dataCorte = new Date();
      dataCorte.setDate(dataCorte.getDate() - lookbackDays);

      const alunos = await this.sophia.getAllAlunos();
      this.logger.log(`Processando ${alunos.length} alunos`);

      const clientes: RecivCliente[] = [];
      const contratos: RecivContrato[] = [];
      const titulos: RecivTitulo[] = [];
      const baixas: RecivBaixa[] = [];

      for (const aluno of alunos) {
        try {
          const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
          const respFinanceiro = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
          if (!respFinanceiro) continue;

          if (!(await this.jaEnviado('cliente', String(respFinanceiro.codigo)))) {
            clientes.push(this.mapCliente(respFinanceiro));
          }

          const matriculas = await this.sophia.getMatriculasAluno(aluno.codigo);
          for (const mat of matriculas) {
            if (!(await this.jaEnviado('contrato', String(mat.codigoMatricula)))) {
              contratos.push(this.mapContrato(mat, respFinanceiro));
            }
          }

          const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo);

          for (const lanc of lancamentos) {
            const venc = new Date(lanc.dataVencimento);

            if (lanc.recebido === 0) {
              // Em aberto → título (apenas dentro da janela de lookback)
              if (venc >= dataCorte && !(await this.jaEnviado('titulo', String(lanc.codigo)))) {
                const mat = matriculas[0]; // associa à primeira matrícula ativa
                titulos.push(this.mapTitulo(lanc, respFinanceiro, mat));
              }
            } else if (lanc.recebido > 0 && lanc.dataPagamento) {
              // Pago → baixa (apenas dentro da janela de lookback)
              const dataPag = new Date(lanc.dataPagamento);
              if (dataPag >= dataCorte && !(await this.jaEnviado('baixa', String(lanc.codigo)))) {
                baixas.push(this.mapBaixa(lanc, respFinanceiro));
              }
            }
          }
        } catch (err: any) {
          this.logger.error(`Erro ao processar aluno ${aluno.codigo}: ${err.message}`);
        }
      }

      // Ordem obrigatória: clientes → contratos → títulos → baixas
      await this.enviarLote<RecivCliente>('cliente', clientes, (i) => this.receiv.enviarClientes(i));
      await this.enviarLote<RecivContrato>('contrato', contratos, (i) => this.receiv.enviarContratos(i));
      await this.enviarLote<RecivTitulo>('titulo', titulos, (i) => this.receiv.enviarTitulos(i));
      await this.enviarLote<RecivBaixa>('baixa', baixas, (i) => this.receiv.enviarBaixas(i));

      this.logger.log('=== Sincronização concluída ===');
    } catch (err: any) {
      this.logger.error(`Erro no ciclo de sync: ${err.message}`, err.stack);
    } finally {
      this.running = false;
    }
  }

  // ─── Mappers ────────────────────────────────────────────────────────────────

  private get codigoCredor(): number {
    return this.config.get<number>('receiv.codigoCredor') ?? 0;
  }

  private toRecivDate(iso: string): string {
    const d = iso.substring(0, 10).split('-');
    return `${d[2]}/${d[1]}/${d[0]}`;
  }

  private mapCliente(resp: ResponsavelAlunoApiModel): RecivCliente {
    return {
      codigo_do_credor: this.codigoCredor,
      codigo_cliente: resp.codigo,
      nome_do_cliente: resp.nome,
      cpf_ou_cnpj: resp.cpf?.replace(/\D/g, ''),
      e_mail: resp.email,
      celular: resp.celular?.replace(/\D/g, ''),
      telefone: resp.telefone?.replace(/\D/g, ''),
    };
  }

  private mapContrato(mat: MatriculaAlunoApiModel, resp: ResponsavelAlunoApiModel): RecivContrato {
    return {
      codigo_do_credor: this.codigoCredor,
      numero_do_contrato: String(mat.codigoMatricula),
      cpf_ou_cnpj: resp.cpf?.replace(/\D/g, ''),
      codigo_cliente: resp.codigo,
      descricao: mat.nomeTurma ?? `Matrícula ${mat.codigoMatricula}`,
      data_inicial_contrato: mat.dataMatricula ? this.toRecivDate(mat.dataMatricula) : undefined,
      situacao_do_contrato: 1,
    };
  }

  private mapTitulo(
    lanc: LancamentoAlunoApiModel,
    resp: ResponsavelAlunoApiModel,
    mat?: MatriculaAlunoApiModel,
  ): RecivTitulo {
    return {
      codigo_do_credor: this.codigoCredor,
      codigo_cliente: resp.codigo,
      cpf_ou_cnpj: resp.cpf?.replace(/\D/g, ''),
      titulo: lanc.codigo,
      codigo_do_titulo: lanc.codigo,
      numero_do_contrato: mat ? String(mat.codigoMatricula) : undefined,
      descricao_servico: lanc.descricao,
      vencimento_do_titulo: this.toRecivDate(lanc.dataVencimento),
      vencimento_original: this.toRecivDate(lanc.dataVencimento),
      valor_do_titulo: lanc.valorPrevisto,
      valor_bruto: lanc.valorPrevisto,
      situacao: 1,
      linha_digitavel_boleto: lanc.linhaDigitavel,
    };
  }

  private mapBaixa(lanc: LancamentoAlunoApiModel, resp: ResponsavelAlunoApiModel): RecivBaixa {
    return {
      codigo_do_credor: this.codigoCredor,
      codigo_cliente: resp.codigo,
      cpf_ou_cnpj: resp.cpf?.replace(/\D/g, ''),
      titulo: lanc.codigo,
      vencimento_do_titulo: this.toRecivDate(lanc.dataVencimento),
      data_pagamento: this.toRecivDate(lanc.dataPagamento!),
      valor_pago: lanc.valorRecebido ?? lanc.valorPrevisto,
      numero_do_contrato: undefined,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async jaEnviado(entityType: string, sophiaId: string): Promise<boolean> {
    return !!(await this.syncLogRepo.findOne({
      where: { entityType: entityType as SyncEntityType, sophiaId, status: 'confirmed' },
    }));
  }

  private async enviarLote<T>(
    entityType: SyncEntityType,
    items: T[],
    sendFn: (items: T[]) => Promise<any>,
  ): Promise<void> {
    if (items.length === 0) return;

    const BATCH_SIZE = 200;
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      try {
        await sendFn(batch);
        const logs: Partial<SyncLog>[] = batch.map((item: any) => ({
          entityType,
          sophiaId: String(item.titulo ?? item.numero_do_contrato ?? item.codigo_cliente ?? ''),
          integId: String(item.titulo ?? item.numero_do_contrato ?? item.codigo_cliente ?? ''),
          status: 'confirmed' as const,
        }));
        await this.syncLogRepo.save(logs as SyncLog[]);
        this.logger.log(`${entityType}: ${batch.length} registro(s) enviados`);
      } catch (err: any) {
        this.logger.error(`Erro ao enviar lote ${entityType}: ${err.message}`);
      }
    }
  }
}
