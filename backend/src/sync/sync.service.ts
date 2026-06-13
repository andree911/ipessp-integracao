import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);
  private running = false;

  constructor(
    private readonly sophia: SophiaService,
    @InjectRepository(ResponsavelCache)
    private readonly cacheRepo: Repository<ResponsavelCache>,
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

      this.logger.log('=== Sincronização concluída ===');
    } catch (err: any) {
      this.logger.error(`Erro no ciclo de sync: ${err.message}`, err.stack);
    } finally {
      this.running = false;
    }
  }
}
