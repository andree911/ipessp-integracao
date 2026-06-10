import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { RecivService } from '../receiv/receiv.service';
import { SyncEntityType, SyncLog } from './entities/sync-log.entity';
import { RecivCliente, RecivContrato, RecivTitulo, RecivBaixa } from '../receiv/types/receiv.types';
import { LancamentoAlunoApiModel, MatriculaAlunoApiModel, ResponsavelAlunoApiModel } from '../sophia/types/sophia.types';

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

  // Disparo manual via POST /sync/trigger
  async triggerSync(): Promise<{ message: string }> {
    if (this.running) {
      return { message: 'Sync já em andamento' };
    }
    void this.runSync();
    return { message: 'Sync iniciado' };
  }

  // Executa conforme SYNC_CRON (padrão: todo início de hora)
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
      const dataInicial = new Date();
      dataInicial.setDate(dataInicial.getDate() - lookbackDays);
      const dataFinal = new Date();

      const alunos = await this.sophia.getAllAlunos();
      this.logger.log(`Processando ${alunos.length} alunos`);

      const clientes: RecivCliente[] = [];
      const contratos: RecivContrato[] = [];
      const titulos: RecivTitulo[] = [];
      const baixas: RecivBaixa[] = [];

      for (const aluno of alunos) {
        try {
          const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
          const respFinanceiro = responsaveis.find((r) => r.tipoResponsavel === 'F') ?? responsaveis[0];
          if (!respFinanceiro) continue;

          // Responsável → Cliente Receiv
          if (!(await this.jaEnviado('cliente', String(respFinanceiro.codigo)))) {
            clientes.push(this.mapCliente(respFinanceiro));
          }

          // Matrículas → Contratos Receiv
          const matriculas = await this.sophia.getMatriculasAluno(aluno.codigo);
          for (const mat of matriculas) {
            if (!(await this.jaEnviado('contrato', String(mat.codigo)))) {
              contratos.push(this.mapContrato(mat, respFinanceiro));
            }
          }

          // Lançamentos → Títulos ou Baixas
          const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo, dataInicial, dataFinal);
          for (const lanc of lancamentos) {
            const matriculaLanc = matriculas.find((m) => m.codigo === lanc.codigoMatricula);

            if (lanc.situacao === 'A') {
              if (!(await this.jaEnviado('titulo', String(lanc.codigo)))) {
                titulos.push(this.mapTitulo(lanc, respFinanceiro, matriculaLanc));
              }
            } else if (lanc.situacao === 'P' && lanc.dataPagamento) {
              if (!(await this.jaEnviado('baixa', String(lanc.codigo)))) {
                baixas.push(this.mapBaixa(lanc, respFinanceiro));
              }
            }
          }
        } catch (err: any) {
          this.logger.error(`Erro ao processar aluno ${aluno.codigo}: ${err.message}`);
        }
      }

      // Ordem obrigatória: clientes → contratos → títulos → baixas
      await this.enviarLote<RecivCliente>('cliente', clientes, (items) => this.receiv.enviarClientes(items));
      await this.enviarLote<RecivContrato>('contrato', contratos, (items) => this.receiv.enviarContratos(items));
      await this.enviarLote<RecivTitulo>('titulo', titulos, (items) => this.receiv.enviarTitulos(items));
      await this.enviarLote<RecivBaixa>('baixa', baixas, (items) => this.receiv.enviarBaixas(items));

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
    // Receiv espera DD/MM/YYYY; SophiA retorna YYYY-MM-DDThh:mm:ss ou YYYY-MM-DD
    const d = iso.substring(0, 10).split('-');
    return `${d[2]}/${d[1]}/${d[0]}`;
  }

  private mapCliente(resp: ResponsavelAlunoApiModel): RecivCliente {
    return {
      codigo_do_credor: this.codigoCredor,
      codigo_cliente: resp.codigo,
      nome_do_cliente: resp.nome,
      cpf_ou_cnpj: resp.cpf?.replace(/\D/g, ''),
      rg: resp.rg,
      e_mail: resp.email,
      celular: resp.celular?.replace(/\D/g, ''),
      telefone: resp.telefone?.replace(/\D/g, ''),
      logradouro: resp.logradouro,
      numero_no_logradouro: resp.numero,
      complemento: resp.complemento,
      bairro: resp.bairro,
      municipio: resp.cidade,
      uf: resp.uf,
      cep: resp.cep?.replace(/\D/g, ''),
    };
  }

  private mapContrato(mat: MatriculaAlunoApiModel, resp: ResponsavelAlunoApiModel): RecivContrato {
    return {
      codigo_do_credor: this.codigoCredor,
      numero_do_contrato: String(mat.codigo),
      cpf_ou_cnpj: resp.cpf?.replace(/\D/g, ''),
      codigo_cliente: resp.codigo,
      descricao: `Matrícula ${mat.codigo}`,
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
      numero_do_contrato: mat ? String(mat.codigo) : undefined,
      descricao_servico: lanc.descricao,
      vencimento_do_titulo: this.toRecivDate(lanc.dataVencimento),
      vencimento_original: this.toRecivDate(lanc.dataVencimento),
      valor_do_titulo: lanc.valor,
      valor_bruto: lanc.valor,
      situacao: 1,
      linha_digitavel_boleto: lanc.codigoBarras,
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
      valor_pago: lanc.valorPago ?? lanc.valor,
      numero_do_contrato: lanc.codigoMatricula ? String(lanc.codigoMatricula) : undefined,
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────────

  private async jaEnviado(entityType: string, sophiaId: string): Promise<boolean> {
    const existing = await this.syncLogRepo.findOne({
      where: { entityType: entityType as SyncEntityType, sophiaId, status: 'confirmed' },
    });
    return !!existing;
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
          sophiaId: String(item.titulo ?? item.codigo_cliente ?? ''),
          integId: String(item.titulo ?? item.numero_do_contrato ?? item.codigo_cliente ?? ''),
          status: 'confirmed' as const, // Receiv não retorna batch_id; confirmamos imediatamente
        }));
        await this.syncLogRepo.save(logs as SyncLog[]);
        this.logger.log(`${entityType}: ${batch.length} registro(s) enviados e confirmados`);
      } catch (err: any) {
        this.logger.error(`Erro ao enviar lote ${entityType}: ${err.message}`);
      }
    }
  }
}
