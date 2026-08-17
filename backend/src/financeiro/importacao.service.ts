import { Injectable, Logger } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { errMsg } from '../common/err.util';
import { encontrarSubstitutosPagos } from '../common/lancamento-substituto.util';

export interface ResultadoImportacao {
  clientesImportados: number;
  lancamentosImportados: number;
  orfaosResolvidos: number;
  orfaosAmbiguos: number;
  orfaosSemMatch: number;
  erros: string[];
}

/** Persiste clientes e lançamentos no cache local. Usado pelo SyncService (hourly cron). */
@Injectable()
export class ImportacaoService {
  private readonly logger = new Logger(ImportacaoService.name);

  constructor(private readonly financeiro: FinanceiroService) {}

  /**
   * Importa via JSON estruturado — usado pelo SyncService para os alunos Sophia.
   */
  async importarClientes(
    registros: Array<{
      codigoSophia: number;
      cpf: string;
      nomeAluno: string;
      nomeResponsavel: string;
      emailResponsavel: string;
      telefoneResponsavel?: string;
      ra?: string;
      lancamentos: Array<{
        codigoSophia: number;
        descricao?: string;
        valorPrevisto: number;
        dataVencimento: string;
        recebido: number;
        linhaDigitavel?: string;
        urlBoleto?: string;
        codigoPix?: string;
        codigoBoleto?: number;
        competencia?: string;
      }>;
    }>,
  ): Promise<ResultadoImportacao> {
    let clientesImportados = 0;
    let lancamentosImportados = 0;
    let orfaosResolvidos = 0;
    let orfaosAmbiguos = 0;
    let orfaosSemMatch = 0;
    const erros: string[] = [];

    for (const reg of registros) {
      try {
        const cliente = await this.financeiro.upsertCliente({
          codigoSophia: reg.codigoSophia,
          cpf: reg.cpf.replace(/\D/g, ''),
          nomeAluno: reg.nomeAluno,
          nomeResponsavel: reg.nomeResponsavel,
          emailResponsavel: reg.emailResponsavel,
          telefoneResponsavel: reg.telefoneResponsavel,
          ra: reg.ra,
        });
        clientesImportados++;

        for (const lanc of reg.lancamentos) {
          try {
            await this.financeiro.upsertLancamento({
              codigoSophia: lanc.codigoSophia,
              codigoCliente: cliente.id,
              descricao: lanc.descricao,
              valorPrevisto: lanc.valorPrevisto,
              dataVencimento: lanc.dataVencimento.substring(0, 10),
              recebido: lanc.recebido > 0,
              linhaDigitavel: lanc.linhaDigitavel,
              urlBoleto: lanc.urlBoleto,
              codigoPix: lanc.codigoPix,
              codigoBoleto: lanc.codigoBoleto,
              competencia: lanc.competencia,
            });
            lancamentosImportados++;
          } catch (err: unknown) {
            erros.push(
              `Lançamento ${lanc.codigoSophia} do cliente ${reg.codigoSophia}: ${errMsg(err)}`,
            );
          }
        }

        // Reconciliação de órfãos: a Sophia por vezes substitui um lançamento
        // por outro (código E vencimento diferentes) sem nunca marcar o
        // antigo como pago -- ele fica "pendente" pra sempre no cache local
        // porque o upsert acima só toca em quem AINDA existe ao vivo. Sem
        // isso, o cache acumula órfãos indefinidamente e qualquer coisa que
        // leia lancamentos_cache (job de email, painéis do corporativo)
        // continua vendo dívida que já foi paga por outro lançamento.
        // Confirmado no incidente de 2026-08-12 (cliente Renata da Cruz
        // Silva, ver memória do projeto) -- essa é a correção na fonte,
        // complementar à checagem defensiva que já existe no email-job.
        try {
          const codigosVivos = new Set(
            reg.lancamentos.map((l) => l.codigoSophia),
          );
          const abertos = await this.financeiro.getLancamentosAbertosDoCliente(
            cliente.id,
          );
          const orfaos = abertos.filter(
            (a) => a.codigoSophia != null && !codigosVivos.has(a.codigoSophia),
          );

          const usados = new Set<number>();
          for (const orfao of orfaos) {
            const candidatos = encontrarSubstitutosPagos(
              {
                dataVencimento: orfao.dataVencimento,
                valorPrevisto: orfao.valorPrevisto,
              },
              reg.lancamentos.map((l) => ({
                codigo: l.codigoSophia,
                recebido: l.recebido,
                dataVencimento: l.dataVencimento,
                valorPrevisto: l.valorPrevisto,
              })),
              usados,
            );

            if (candidatos.length === 1) {
              usados.add(candidatos[0].codigo);
              await this.financeiro.marcarRecebido(
                orfao.codigoSophia!,
                cliente.id,
              );
              orfaosResolvidos++;
              this.logger.log(
                `Lançamento órfão ${orfao.id} (cliente ${cliente.id}) resolvido — substituto código ${candidatos[0].codigo}`,
              );
            } else if (candidatos.length > 1) {
              orfaosAmbiguos++;
            } else {
              orfaosSemMatch++;
            }
          }
        } catch (err: unknown) {
          erros.push(
            `Reconciliação de órfãos do cliente ${reg.codigoSophia}: ${errMsg(err)}`,
          );
        }
      } catch (err: unknown) {
        erros.push(`Cliente ${reg.codigoSophia}: ${errMsg(err)}`);
      }
    }

    this.logger.log(
      `Importação concluída: ${clientesImportados} clientes, ${lancamentosImportados} lançamentos, ` +
        `${orfaosResolvidos} órfãos resolvidos, ${orfaosAmbiguos} órfãos ambíguos, ${orfaosSemMatch} órfãos sem match, ` +
        `${erros.length} erros`,
    );
    return {
      clientesImportados,
      lancamentosImportados,
      orfaosResolvidos,
      orfaosAmbiguos,
      orfaosSemMatch,
      erros,
    };
  }
}
