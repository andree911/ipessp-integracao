import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { ImportacaoService } from '../financeiro/importacao.service';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';
import { Lead } from '../leads/entities/lead.entity';
import { AlunoApiModel } from '../sophia/types/sophia.types';
import { errMsg, errStack } from '../common/err.util';

const SYNC_BATCH_SIZE = 5;

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

    let totalAlunos = 0;
    let totalClientes = 0;
    let totalLancamentos = 0;

    try {
      const alunos = await this.sophia.getAllAlunos();
      this.logger.log(`${alunos.length} alunos encontrados`);

      for (let i = 0; i < alunos.length; i += SYNC_BATCH_SIZE) {
        const batch = alunos.slice(i, i + SYNC_BATCH_SIZE);
        const resultados = await Promise.allSettled(batch.map((a) => this.processarAluno(a)));
        for (let j = 0; j < resultados.length; j++) {
          const r = resultados[j];
          if (r.status === 'fulfilled') {
            if (r.value.processado) totalAlunos++;
            totalClientes += r.value.clientes;
            totalLancamentos += r.value.lancamentos;
          } else {
            this.logger.error(`Erro ao processar aluno ${batch[j].codigo}: ${r.reason?.message}`);
          }
        }
      }

      await this.reconciliarLeadsPagina(alunos);

      this.logger.log(
        `=== Sincronização concluída: ${totalAlunos} alunos, ${totalClientes} clientes, ${totalLancamentos} lançamentos ===`,
      );
    } catch (err: unknown) {
      this.logger.error(`Erro no ciclo de sync: ${errMsg(err)}`, errStack(err));
    } finally {
      this.running = false;
    }
  }

  private async processarAluno(
    aluno: AlunoApiModel,
  ): Promise<{ processado: boolean; clientes: number; lancamentos: number }> {
    const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
    const resp = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
    if (!resp?.cpf) return { processado: false, clientes: 0, lancamentos: 0 };

    const cpf = resp.cpf.replace(/\D/g, '');

    const dadosResp = {
      cpf,
      codigoAluno: aluno.codigo,
      nomeAluno: aluno.nome,
      codigoResponsavel: resp.codigo,
      nomeResponsavel: resp.nome,
      email: resp.email ?? undefined,
    };
    const existente = await this.cacheRepo.findOne({ where: { cpf, codigoAluno: aluno.codigo } });
    if (existente) {
      await this.cacheRepo.update(existente.id, dadosResp);
    } else {
      await this.cacheRepo.save(this.cacheRepo.create(dadosResp));
    }

    let clientes = 0;
    let lancamentos = 0;
    if (resp.email) {
      const lancamentosAluno = await this.sophia.getLancamentosAluno(aluno.codigo);
      const resultado = await this.importacao.importarClientes([{
        codigoSophia: aluno.codigo,
        cpf,
        nomeAluno: aluno.nome,
        nomeResponsavel: resp.nome,
        emailResponsavel: resp.email,
        telefoneResponsavel: resp.celular ?? resp.telefone,
        ra: aluno.codigoExterno ?? undefined,
        lancamentos: lancamentosAluno.map((l) => ({
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
      }]);
      clientes = resultado.clientesImportados;
      lancamentos = resultado.lancamentosImportados;
      if (resultado.erros.length > 0) {
        this.logger.warn(`Aluno ${aluno.codigo}: ${resultado.erros[0]}`);
      }
    }

    return { processado: true, clientes, lancamentos };
  }

  private async reconciliarLeadsPagina(
    alunos: { codigo: number; nome: string; email?: string }[],
  ): Promise<void> {
    const emailMap = new Map<string, number>();
    for (const aluno of alunos) {
      if (aluno.email) emailMap.set(aluno.email.toLowerCase(), aluno.codigo);
    }
    if (emailMap.size === 0) return;

    const emails = [...emailMap.keys()];
    const leads = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.sophiaAlunoId IS NULL')
      .andWhere('LOWER(l.email) IN (:...emails)', { emails })
      .getMany();

    for (const lead of leads) {
      const codigoAluno = emailMap.get(lead.email.toLowerCase());
      if (!codigoAluno) continue;
      await this.leadRepo.update(lead.id, { sophiaAlunoId: codigoAluno, status: 'matriculado' });
    }

    if (leads.length > 0) {
      this.logger.log(`Leads reconciliados: ${leads.length} marcados como matriculados`);
    }
  }
}
