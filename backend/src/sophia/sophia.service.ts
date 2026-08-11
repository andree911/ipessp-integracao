import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { errMsg, isAxios401, axiosDetail } from '../common/err.util';
import {
  AlunoApiModel,
  AlunoDetalhadoApiModel,
  AutenticacaoAlunoApiModelRetorno,
  ColaboradorApiModel,
  HorarioMatriculaApiModel,
  LancamentoAlunoApiModel,
  ListaChamadaItem,
  MatriculaAlunoApiModel,
  MatriculaFrequenciaApiModel,
  MatriculasWrapperApiModel,
  NotasMatriculaApiModel,
  ResponsavelAlunoApiModel,
} from './types/sophia.types';

@Injectable()
export class SophiaService implements OnModuleInit {
  private readonly logger = new Logger(SophiaService.name);
  private readonly baseUrl: string;
  private readonly usuario: string;
  private readonly senha: string;
  private readonly tenant: string;
  private token = '';

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('sophia.baseUrl')!;
    this.usuario = this.config.get<string>('sophia.usuario')!;
    this.senha = this.config.get<string>('sophia.senha')!;
    this.tenant = this.config.get<string>('sophia.tenant') ?? '';
  }

  async onModuleInit() {
    try {
      await this.autenticar();
    } catch (err: unknown) {
      this.logger.error(`SophiA: falha na autenticação inicial — ${errMsg(err)}`);
    }
  }

  @Cron('0 * * * *')
  private async refreshToken(): Promise<void> {
    try {
      await this.autenticar();
    } catch (err: unknown) {
      this.logger.warn(`SophiA: falha no refresh periódico do token — ${errMsg(err)}`);
    }
  }

  private get apiBase(): string {
    return this.tenant
      ? `${this.baseUrl}/${this.tenant}/api/v1`
      : `${this.baseUrl}/api/v1`;
  }

  private async autenticar(): Promise<void> {
    const url = this.tenant
      ? `${this.baseUrl}/${this.tenant}/api/v1/Autenticacao`
      : `${this.baseUrl}/api/v1/Autenticacao`;

    const { data } = await firstValueFrom(
      this.http.post<string>(url, { usuario: this.usuario, senha: this.senha }, {
        headers: { 'Content-Type': 'application/json', accept: 'text/plain' },
      }),
    );
    this.token = typeof data === 'string' ? data.replace(/"/g, '').trim() : data;
    this.logger.log('SophiA: token obtido com sucesso');
  }

  private headers(): AxiosRequestConfig['headers'] {
    return { token: this.token };
  }

  // Reautentica em caso de 401 e retenta a chamada uma vez
  private async post<T>(url: string, body: unknown): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.http.post<T>(url, body, { headers: this.headers() }),
      );
      return data;
    } catch (err: unknown) {
      if (isAxios401(err)) {
        this.logger.warn('SophiA: token expirado, reautenticando...');
        await this.autenticar();
        const { data } = await firstValueFrom(
          this.http.post<T>(url, body, { headers: this.headers() }),
        );
        return data;
      }
      throw err;
    }
  }

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<T>(url, { headers: this.headers(), params }),
      );
      return data;
    } catch (err: unknown) {
      if (isAxios401(err)) {
        this.logger.warn('SophiA: token expirado, reautenticando...');
        await this.autenticar();
        const { data } = await firstValueFrom(
          this.http.get<T>(url, { headers: this.headers(), params }),
        );
        return data;
      }
      throw err;
    }
  }

  async getAlunos(pagina = 1, tamanhoPagina = 100, nome?: string): Promise<AlunoApiModel[]> {
    return this.get<AlunoApiModel[]>(`${this.apiBase}/Alunos`, {
      Pagina: pagina,
      TamanhoPagina: tamanhoPagina,
      ...(nome ? { Nome: nome } : {}),
    });
  }

  async getResponsaveisAluno(idAluno: number): Promise<ResponsavelAlunoApiModel[]> {
    return this.get<ResponsavelAlunoApiModel[]>(
      `${this.apiBase}/alunos/${idAluno}/responsaveis`,
    );
  }

  async getMatriculasAluno(idAluno: number): Promise<MatriculaAlunoApiModel[]> {
    const data = await this.get<MatriculasWrapperApiModel[]>(
      `${this.apiBase}/alunos/${idAluno}/Matriculas`,
    );
    this.logger.log(`SophiA getMatriculasAluno raw: ${JSON.stringify(data)}`);
    return data.flatMap((w) => w.matriculas ?? []);
  }

  async getLancamentosAluno(idAluno: number): Promise<LancamentoAlunoApiModel[]> {
    return this.get<LancamentoAlunoApiModel[]>(
      `${this.apiBase}/alunos/${idAluno}/Lancamentos`,
    );
  }

  async getAlunoById(id: number): Promise<AlunoDetalhadoApiModel> {
    return this.get<AlunoDetalhadoApiModel>(`${this.apiBase}/Alunos/${id}`);
  }

  async searchAlunoByEmail(email: string): Promise<AlunoApiModel | null> {
    // Tenta filtrar por email direto; se não suportado, varre as páginas
    try {
      const result = await this.get<AlunoApiModel[]>(`${this.apiBase}/Alunos`, {
        Email: email,
        TamanhoPagina: 1,
      });
      if (result.length > 0) return result[0];
    } catch { /* ignora e tenta varredura */ }

    let pagina = 1;
    const tamanhoPagina = 100;
    while (true) {
      const page = await this.getAlunos(pagina, tamanhoPagina);
      const found = page.find(a => a.email?.toLowerCase() === email.toLowerCase());
      if (found) return found;
      if (page.length < tamanhoPagina) break;
      pagina++;
    }
    return null;
  }

  async getBoleto(idAluno: number, codigoBoleto: number): Promise<Buffer> {
    const url = `${this.apiBase}/alunos/${idAluno}/Boletos/${codigoBoleto}`;
    const { data } = await firstValueFrom(
      this.http.get<string>(url, { headers: this.headers(), responseType: 'text' }),
    );
    const b64 = (data as string).replace(/^"|"$/g, '');
    return Buffer.from(b64, 'base64');
  }

  async getColaboradores(params?: { Email?: string; Nome?: string; Pagina?: number; TamanhoPagina?: number }): Promise<ColaboradorApiModel[]> {
    const p: Record<string, unknown> = {};
    if (params?.Email)         p['Email']         = params.Email;
    if (params?.Nome)          p['Nome']           = params.Nome;
    if (params?.Pagina)        p['Pagina']         = params.Pagina;
    if (params?.TamanhoPagina) p['TamanhoPagina']  = params.TamanhoPagina;
    return this.get<ColaboradorApiModel[]>(`${this.apiBase}/Colaboradores`, p);
  }

  async getListaChamadaProfessor(idProfessor: number, params?: Record<string, string>): Promise<ListaChamadaItem[]> {
    return this.get<ListaChamadaItem[]>(`${this.apiBase}/ListaChamada/Professor/${idProfessor}`, params);
  }

  async getAlunosListaChamada(idLista: number): Promise<unknown[]> {
    return this.get<unknown[]>(`${this.apiBase}/ListaChamada/Alunos/${idLista}`);
  }

  async getAllAlunos(): Promise<AlunoApiModel[]> {
    // A API Sophia ignora TamanhoPagina e retorna todos os registros em uma única resposta.
    // Paginação real não é suportada — limitação conhecida da API externa.
    const alunos = await this.getAlunos(1, 9999);
    this.logger.log(`SophiA: ${alunos.length} alunos carregados`);
    if (alunos.length > 5000) {
      this.logger.warn(`Volume alto (${alunos.length} alunos) — monitorar uso de memória no sync`);
    }
    return alunos;
  }

  async getCursos(): Promise<unknown> {
    return this.get<unknown>(`${this.apiBase}/Cursos`);
  }

  // Valida a senha REAL do aluno (a mesma de 6 dígitos que a Sophia manda por
  // e-mail) — não temos como conferir isso localmente, então delegamos pra
  // Sophia a cada tentativa de login do Portal do Aluno. O swagger descreve
  // "codigo"/"email" indo no header, mas o schema do body (AutenticacaoAlunoApiModel)
  // é quem manda: os três campos (email, codigo, senha) vão no corpo da requisição.
  async validarLogin(params: { codigo?: string; email?: string; senha: string }): Promise<AutenticacaoAlunoApiModelRetorno> {
    try {
      return await this.post<AutenticacaoAlunoApiModelRetorno>(`${this.apiBase}/Alunos/ValidarLogin`, params);
    } catch (err: unknown) {
      const detail = axiosDetail(err);
      this.logger.warn(`SophiA validarLogin erro: ${JSON.stringify(detail)}`);
      throw err;
    }
  }

  async getNotasAvaliacoes(idMatricula: number): Promise<NotasMatriculaApiModel> {
    return this.get<NotasMatriculaApiModel>(`${this.apiBase}/alunos/Matriculas/${idMatricula}/NotasAvaliacoesCompleto`);
  }

  async getFrequenciaCompleta(idMatricula: number): Promise<MatriculaFrequenciaApiModel> {
    return this.get<MatriculaFrequenciaApiModel>(`${this.apiBase}/alunos/Matriculas/${idMatricula}/FrequenciaCompleto`);
  }

  async getHorarioDetalhado(idMatricula: number): Promise<HorarioMatriculaApiModel> {
    return this.get<HorarioMatriculaApiModel>(`${this.apiBase}/alunos/matriculas/${idMatricula}/QuadrosHorarios/Detalhados`);
  }

  async postDocumentoCliente(idCliente: number, doc: { descricao: string; url: string; extensao: string }): Promise<unknown> {
    return this.post<unknown>(`${this.apiBase}/clientes/${idCliente}/Documentos`, doc);
  }

  async getTurmaDetalhada(codigoTurma: number): Promise<unknown> {
    return this.get<unknown>(`${this.apiBase}/Turmas/detalhada/${codigoTurma}`);
  }
}
