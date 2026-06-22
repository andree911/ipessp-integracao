import { Injectable, Logger } from '@nestjs/common';
import { FinanceiroService } from './financeiro.service';

export interface ResultadoImportacao {
  clientesImportados: number;
  lancamentosImportados: number;
  erros: string[];
}

/**
 * Importa clientes e lançamentos a partir de dados exportados do Sophia.
 * O formato exato do CSV/Excel será definido amanhã após verificar o export do Sophia.
 * Por enquanto, expõe métodos para importar via JSON (usado pelo sync de alunos)
 * e uma estrutura preparada para o CSV.
 */
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
      lancamentos: Array<{
        codigoSophia: number;
        descricao?: string;
        valorPrevisto: number;
        dataVencimento: string;
        recebido: number;
        linhaDigitavel?: string;
        urlBoleto?: string;
        codigoPix?: string;
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
              recebido: lanc.recebido,
              linhaDigitavel: lanc.linhaDigitavel,
              urlBoleto: lanc.urlBoleto,
              codigoPix: lanc.codigoPix,
              competencia: lanc.competencia,
            });
            lancamentosImportados++;
          } catch (err: any) {
            erros.push(`Lançamento ${lanc.codigoSophia} do cliente ${reg.codigoSophia}: ${err.message}`);
          }
        }
      } catch (err: any) {
        erros.push(`Cliente ${reg.codigoSophia}: ${err.message}`);
      }
    }

    this.logger.log(
      `Importação concluída: ${clientesImportados} clientes, ${lancamentosImportados} lançamentos, ${erros.length} erros`,
    );
    return { clientesImportados, lancamentosImportados, erros };
  }

  /**
   * Importa via CSV exportado do Sophia.
   * TODO: implementar o parser após confirmar o formato do export amanhã.
   * Colunas esperadas (a confirmar): codigo, cpf, nome, email, telefone,
   *   cod_lancamento, descricao, valor, vencimento, pago, linha_digitavel, pix
   */
  async importarCsv(csvContent: string): Promise<ResultadoImportacao> {
    const linhas = csvContent.split('\n').filter(l => l.trim());
    if (linhas.length < 2) {
      return { clientesImportados: 0, lancamentosImportados: 0, erros: ['CSV vazio ou sem dados'] };
    }

    // TODO: mapear as colunas reais do export do Sophia
    // const cabecalho = linhas[0].split(';').map(c => c.trim());
    this.logger.warn('importarCsv: formato do CSV ainda não mapeado — aguardando export do Sophia');
    return {
      clientesImportados: 0,
      lancamentosImportados: 0,
      erros: ['Formato do CSV ainda não mapeado. Confirme as colunas do export do Sophia e implemente o parser.'],
    };
  }
}
