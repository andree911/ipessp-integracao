import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { ImportacaoService } from '../financeiro/importacao.service';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';
import { Lead } from '../leads/entities/lead.entity';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private running = false;

  constructor(
    private readonly sophia: SophiaService,
    private readonly importacao: ImportacaoService,
    @InjectRepository(ResponsavelCache)
    private readonly cacheRepo: Repository<ResponsavelCache>,
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
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
      const alunos = await this.sophia.getAllAlunos();
      this.logger.log(`Processando ${alunos.length} alunos`);

      const cacheEntries: Partial<ResponsavelCache>[] = [];

      for (const aluno of alunos) {
        try {
          const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
          const respFinanceiro = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
          if (!respFinanceiro?.cpf) continue;

          cacheEntries.push({
            cpf: respFinanceiro.cpf.replace(/\D/g, ''),
            codigoAluno: aluno.codigo,
            nomeAluno: aluno.nome,
            codigoResponsavel: respFinanceiro.codigo,
            nomeResponsavel: respFinanceiro.nome,
            email: respFinanceiro.email,
          });
        } catch (err: any) {
          this.logger.error(`Erro ao processar aluno ${aluno.codigo}: ${err.message}`);
        }
      }

      if (cacheEntries.length > 0) {
        await this.cacheRepo.upsert(cacheEntries as ResponsavelCache[], ['cpf', 'codigoAluno']);
        this.logger.log(`Cache IA: ${cacheEntries.length} responsáveis indexados`);
      }

      // Sincroniza alunos Sophia nas novas tabelas financeiro (clientes_cache + lancamentos_cache)
      await this.sincronizarFinanceiro(alunos);

      // Reconcilia leads não convertidos com alunos do SophiA (match por e-mail)
      await this.reconciliarLeads(alunos);

      this.logger.log('=== Sincronização concluída ===');
    } catch (err: any) {
      this.logger.error(`Erro no ciclo de sync: ${err.message}`, err.stack);
    } finally {
      this.running = false;
    }
  }

  private async sincronizarFinanceiro(alunos: { codigo: number; nome: string; email?: string }[]): Promise<void> {
    const registros: Parameters<ImportacaoService['importarClientes']>[0] = [];

    for (const aluno of alunos) {
      try {
        const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
        const resp = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
        if (!resp?.cpf || !resp?.email) continue;

        const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo);
        registros.push({
          codigoSophia: aluno.codigo,
          cpf: resp.cpf,
          nomeAluno: aluno.nome,
          nomeResponsavel: resp.nome,
          emailResponsavel: resp.email,
          telefoneResponsavel: resp.celular ?? resp.telefone,
          lancamentos: lancamentos.map((l) => ({
            codigoSophia: l.codigo,
            descricao: l.descricao,
            valorPrevisto: l.valorPrevisto,
            dataVencimento: l.dataVencimento,
            recebido: l.recebido,
            linhaDigitavel: l.linhaDigitavel,
            urlBoleto: l.urlBoletoDigital,
            codigoPix: l.codigoPix,
            competencia: l.competencia,
          })),
        });
      } catch (err: any) {
        this.logger.error(`Financeiro sync: erro no aluno ${aluno.codigo}: ${err.message}`);
      }
    }

    if (registros.length > 0) {
      const resultado = await this.importacao.importarClientes(registros);
      this.logger.log(
        `Financeiro sync: ${resultado.clientesImportados} clientes, ${resultado.lancamentosImportados} lançamentos sincronizados`,
      );
    }
  }

  // Cruza leads sem vínculo de aluno com a lista de alunos do SophiA por e-mail.
  // Quando há match, marca o lead como 'matriculado' e grava o sophiaAlunoId.
  private async reconciliarLeads(alunos: { codigo: number; nome: string; email?: string }[]): Promise<void> {
    // Busca leads que têm email e ainda não foram convertidos
    const leads = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.sophiaAlunoId IS NULL')
      .andWhere("l.email IS NOT NULL AND l.email != ''")
      .getMany();

    if (leads.length === 0) return;

    // Monta índice email → codigoAluno para O(1) lookup
    const emailMap = new Map<string, number>();
    for (const aluno of alunos) {
      if (aluno.email) emailMap.set(aluno.email.toLowerCase(), aluno.codigo);
    }

    let convertidos = 0;
    for (const lead of leads) {
      const codigoAluno = emailMap.get(lead.email.toLowerCase());
      if (!codigoAluno) continue;

      await this.leadRepo.update(lead.id, {
        sophiaAlunoId: codigoAluno,
        status: 'matriculado',
      });
      convertidos++;
    }

    if (convertidos > 0) {
      this.logger.log(`Leads reconciliados: ${convertidos} marcados como matriculados`);
    }
  }
}
