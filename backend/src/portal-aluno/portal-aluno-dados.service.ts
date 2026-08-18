import { ForbiddenException, Injectable } from '@nestjs/common';
import { SophiaService } from '../sophia/sophia.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { StorageService } from '../common/storage.service';

@Injectable()
export class PortalAlunoDadosService {
  constructor(
    private readonly sophia: SophiaService,
    private readonly financeiro: FinanceiroService,
    private readonly storage: StorageService,
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

  async minhasNotas(codigoSophia: number, idMatricula: number) {
    await this.verificarMatriculaPertenceAoAluno(codigoSophia, idMatricula);
    return this.sophia.getNotasAvaliacoes(idMatricula);
  }

  async minhaFrequencia(codigoSophia: number, idMatricula: number) {
    await this.verificarMatriculaPertenceAoAluno(codigoSophia, idMatricula);
    return this.sophia.getFrequenciaCompleta(idMatricula);
  }

  async meuHorario(codigoSophia: number, idMatricula: number) {
    await this.verificarMatriculaPertenceAoAluno(codigoSophia, idMatricula);
    return this.sophia.getHorarioDetalhado(idMatricula);
  }

  // Sem isso, qualquer aluno autenticado podia trocar o "matricula" da query
  // string e ler notas/frequência/horário de outro aluno (o token só prova
  // quem é o aluno, nunca qual matrícula ele pode consultar) — ver
  // financeiro/curso acima, que já usavam só o codigoSophia do token.
  private async verificarMatriculaPertenceAoAluno(
    codigoSophia: number,
    idMatricula: number,
  ): Promise<void> {
    const matriculas = await this.sophia.getMatriculasAluno(codigoSophia);
    const pertence = matriculas.some((m) => m.codigoMatricula === idMatricula);
    if (!pertence) {
      throw new ForbiddenException(
        'Matrícula não pertence ao aluno autenticado.',
      );
    }
  }

  // Sophia não aceita arquivo direto (POST /clientes/{id}/Documentos só recebe
  // uma url pra download), então sobe primeiro pro storage e manda a URL
  // pública. Mesmo padrão usado em CandidaturasService.
  // {id} assumido como o mesmo codigoSophia do aluno logado — não dá pra
  // confirmar isso só pelo swagger, revisar no primeiro teste real.
  async enviarDocumento(
    codigoSophia: number,
    descricao: string,
    file: Express.Multer.File,
  ) {
    const path = `documentos/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
    const url = await this.storage.upload(
      'portal-aluno',
      path,
      file.buffer,
      file.mimetype,
    );
    const extensao = (file.originalname.split('.').pop() ?? '').toLowerCase();
    return this.sophia.postDocumentoCliente(codigoSophia, {
      descricao,
      url,
      extensao,
    });
  }
}
