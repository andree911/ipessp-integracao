import { Injectable, Logger } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';
import { errMsg } from '../common/err.util';

export interface ResultadoImportacao {
  clientesImportados: number;
  lancamentosImportados: number;
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
            erros.push(`Lançamento ${lanc.codigoSophia} do cliente ${reg.codigoSophia}: ${errMsg(err)}`);
          }
        }
      } catch (err: unknown) {
        erros.push(`Cliente ${reg.codigoSophia}: ${errMsg(err)}`);
      }
    }

    this.logger.log(
      `Importação concluída: ${clientesImportados} clientes, ${lancamentosImportados} lançamentos, ${erros.length} erros`,
    );
    return { clientesImportados, lancamentosImportados, erros };
  }

}
