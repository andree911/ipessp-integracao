import { Injectable } from '@nestjs/common';
import { SophiaService } from '../sophia/sophia.service';
import { FinanceiroService } from '../financeiro/financeiro.service';

@Injectable()
export class PortalAlunoDadosService {
  constructor(
    private readonly sophia: SophiaService,
    private readonly financeiro: FinanceiroService,
  ) {}

  async meuFinanceiro(codigoSophia: number) {
    return this.financeiro.getByCodigoSophia(codigoSophia);
  }

  async meuCurso(codigoSophia: number) {
    const matriculas = await this.sophia.getMatriculasAluno(codigoSophia);
    return matriculas.map((m) => ({
      codigo: m.codigoMatricula,
      curso: m.nomeSerie ?? null,
      turma: m.nomeTurma ?? null,
      unidade: m.nomeUnidade ?? null,
      situacao: m.situacao ?? null,
      dataMatricula: m.dataMatricula ?? null,
    }));
  }
}
