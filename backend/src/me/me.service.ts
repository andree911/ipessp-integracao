import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Usuario } from '../auth/entities/usuario.entity';
import { Professor } from '../auth/entities/professor.entity';
import { SophiaService } from '../sophia/sophia.service';
import { LancamentoAlunoApiModel } from '../sophia/types/sophia.types';

@Injectable()
export class MeService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Professor) private readonly professorRepo: Repository<Professor>,
    private readonly sophia: SophiaService,
    private readonly config: ConfigService,
  ) {}

  private get sophiaConfigurado() {
    return !!this.config.get<string>('sophia.baseUrl');
  }

  private async resolveAluno(usuarioId: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('usuário não encontrado');
    if (usuario.tipo !== 'aluno') throw new ForbiddenException('acesso restrito a alunos');
    return usuario;
  }

  private async resolveSophiaAlunoId(usuario: Usuario): Promise<number> {
    if (usuario.sophiaAlunoId) return usuario.sophiaAlunoId;

    const aluno = await this.sophia.searchAlunoByEmail(usuario.email);
    if (!aluno) throw new NotFoundException('aluno não encontrado no sistema acadêmico');

    await this.usuarioRepo.update(usuario.id, { sophiaAlunoId: aluno.codigo });
    return aluno.codigo;
  }

  private async resolveProfessorSophiaId(usuarioId: string, email: string): Promise<number> {
    const prof = await this.professorRepo.findOne({ where: { usuarioId } });
    if (prof?.sophiaId) return prof.sophiaId;

    const colaboradores = await this.sophia.getColaboradores({ Email: email, TamanhoPagina: 5 });
    if (!colaboradores.length) throw new NotFoundException('professor não encontrado no SophiA');

    const sophiaId = colaboradores[0].codigo;
    if (prof) {
      await this.professorRepo.update(prof.id, { sophiaId });
    }
    return sophiaId;
  }

  private mapLancamento(l: LancamentoAlunoApiModel) {
    return {
      id: String(l.codigo),
      descricao: l.descricao ?? 'Mensalidade',
      valor: l.valorPrevisto,
      vencimento: l.dataVencimento.substring(0, 10),
      situacao: l.recebido > 0 ? 'recebido' : 'aberto',
      codigo_boleto: l.codigoBoleto ? String(l.codigoBoleto) : null,
    };
  }

  async getAcademico(usuarioId: string) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');

    const usuario = await this.resolveAluno(usuarioId);
    const sophiaId = await this.resolveSophiaAlunoId(usuario);

    const [aluno, matriculas] = await Promise.all([
      this.sophia.getAlunoById(sophiaId),
      this.sophia.getMatriculasAluno(sophiaId),
    ]);

    const matriculaAtiva = matriculas.find(m => m.situacao?.toLowerCase() === 'ativo') ?? matriculas[0];

    return {
      id: String(aluno.codigo),
      nome: aluno.nome,
      email: aluno.email ?? usuario.email,
      telefone: aluno.telefone ?? '',
      curso: matriculaAtiva?.nomeSerie ?? '',
      turma: matriculaAtiva?.nomeTurma ?? '',
      situacao: matriculaAtiva?.situacao ?? '',
    };
  }

  async getFinanceiro(usuarioId: string) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');

    const usuario = await this.resolveAluno(usuarioId);
    const sophiaId = await this.resolveSophiaAlunoId(usuario);

    const lancamentos = await this.sophia.getLancamentosAluno(sophiaId);
    return lancamentos
      .sort((a, b) => b.dataVencimento.localeCompare(a.dataVencimento))
      .map(l => this.mapLancamento(l));
  }

  async getMatriculas(usuarioId: string) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.resolveAluno(usuarioId);
    const sophiaId = await this.resolveSophiaAlunoId(usuario);
    return this.sophia.getMatriculasAluno(sophiaId);
  }

  async getNotas(usuarioId: string, idMatricula: number, query: Record<string, string>) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.resolveAluno(usuarioId);
    await this.resolveSophiaAlunoId(usuario);
    const { Disciplinas, NumeroEtapa, FiltrarEtapa, completo } = query;
    const params = this.filterParams({ Disciplinas, NumeroEtapa, FiltrarEtapa });
    return completo === '1' || completo === 'true'
      ? this.sophia.getNotasCompleto(idMatricula, params)
      : this.sophia.getNotas(idMatricula, params);
  }

  async getFrequencia(usuarioId: string, idMatricula: number, query: Record<string, string>) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.resolveAluno(usuarioId);
    await this.resolveSophiaAlunoId(usuario);
    const { Disciplina, Etapa } = query;
    return this.sophia.getFrequencia(idMatricula, this.filterParams({ Disciplina, Etapa }));
  }

  async getHorarios(usuarioId: string) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.resolveAluno(usuarioId);
    const sophiaId = await this.resolveSophiaAlunoId(usuario);
    return this.sophia.getHorarios(sophiaId);
  }

  async getBoleto(usuarioId: string, codigoBoleto: string) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.resolveAluno(usuarioId);
    const sophiaId = await this.resolveSophiaAlunoId(usuario);

    const lancamentos = await this.sophia.getLancamentosAluno(sophiaId);
    const lancamento = lancamentos.find(l => String(l.codigoBoleto) === codigoBoleto);
    if (!lancamento) throw new NotFoundException('boleto não encontrado');

    return this.sophia.getBoleto(sophiaId, Number(codigoBoleto));
  }

  async getTurmas(usuarioId: string, query: Record<string, string>) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('usuário não encontrado');
    if (usuario.tipo !== 'professor') throw new ForbiddenException('acesso restrito a professores');

    const sophiaId = await this.resolveProfessorSophiaId(usuarioId, usuario.email);
    const { DataInicial, DataFinal, Status } = query;
    return this.sophia.getListaChamadaProfessor(sophiaId, this.filterParams({ DataInicial, DataFinal, Status }));
  }

  async getAlunosTurma(usuarioId: string, idLista: number) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('usuário não encontrado');
    if (usuario.tipo !== 'professor') throw new ForbiddenException('acesso restrito a professores');
    return this.sophia.getAlunosListaChamada(idLista);
  }

  async getAtaNotas(usuarioId: string, query: Record<string, string>) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('usuário não encontrado');
    if (usuario.tipo !== 'professor') throw new ForbiddenException('acesso restrito a professores');
    const { Turma, Disciplina, Etapa, Numero, Codigo } = query;
    return this.sophia.getAtaNotas(this.filterParams({ Turma, Disciplina, Etapa, Numero, Codigo }));
  }

  async getNotasAta(usuarioId: string, idAta: number) {
    if (!this.sophiaConfigurado) throw new ServiceUnavailableException('integração com SophiA não configurada');
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('usuário não encontrado');
    if (usuario.tipo !== 'professor') throw new ForbiddenException('acesso restrito a professores');
    return this.sophia.getNotasAlunos(idAta);
  }

  private filterParams(obj: Record<string, string | undefined>): Record<string, string> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined && v !== ''),
    ) as Record<string, string>;
  }
}
