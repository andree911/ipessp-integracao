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

    let totalAlunos = 0;
    let totalClientes = 0;
    let totalLancamentos = 0;

    try {
      const alunos = await this.sophia.getAllAlunos();
      this.logger.log(`${alunos.length} alunos encontrados`);

      for (const aluno of alunos) {
          try {
            const responsaveis = await this.sophia.getResponsaveisAluno(aluno.codigo);
            const resp = responsaveis.find((r) => r.responsavelFinanceiro) ?? responsaveis[0];
            if (!resp?.cpf) continue;

            const cpf = resp.cpf.replace(/\D/g, '');

            // salva no cache IA
            const dadosResp = {
              cpf,
              codigoAluno: aluno.codigo,
              nomeAluno: aluno.nome,
              codigoResponsavel: resp.codigo,
              nomeResponsavel: resp.nome,
              email: resp.email ?? undefined,
            };
            const existente = await this.cacheRepo.findOne({
              where: { cpf, codigoAluno: aluno.codigo },
            });
            if (existente) {
              await this.cacheRepo.update(existente.id, dadosResp);
            } else {
              await this.cacheRepo.save(this.cacheRepo.create(dadosResp));
            }

            // salva no cache financeiro (só se tiver email)
            if (resp.email) {
              const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo);
              const resultado = await this.importacao.importarClientes([{
                codigoSophia: aluno.codigo,
                cpf,
                nomeAluno: aluno.nome,
                nomeResponsavel: resp.nome,
                emailResponsavel: resp.email,
                telefoneResponsavel: resp.celular ?? resp.telefone,
                ra: aluno.codigoExterno ?? undefined,
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
              }]);
              totalClientes += resultado.clientesImportados;
              totalLancamentos += resultado.lancamentosImportados;
              if (resultado.erros.length > 0) {
                this.logger.warn(`Aluno ${aluno.codigo}: ${resultado.erros[0]}`);
              }
            }

            totalAlunos++;
          } catch (err: any) {
            this.logger.error(`Erro ao processar aluno ${aluno.codigo}: ${err.message}`);
          }
        }

      await this.reconciliarLeadsPagina(alunos);

      this.logger.log(
        `=== Sincronização concluída: ${totalAlunos} alunos, ${totalClientes} clientes, ${totalLancamentos} lançamentos ===`,
      );
    } catch (err: any) {
      this.logger.error(`Erro no ciclo de sync: ${err.message}`, err.stack);
    } finally {
      this.running = false;
    }
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
