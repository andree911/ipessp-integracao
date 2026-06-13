import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import {
  AlunoApiModel,
  LancamentoAlunoApiModel,
  MatriculaAlunoApiModel,
  MatriculasWrapperApiModel,
  ResponsavelAlunoApiModel,
} from './types/sophia.types';

@Injectable()
export class SophiaService {
  private readonly logger = new Logger(SophiaService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly tenant: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('sophia.baseUrl')!;
    this.token = this.config.get<string>('sophia.token')!;
    this.tenant = this.config.get<string>('sophia.tenant') ?? '';
  }

  private get apiBase(): string {
    return this.tenant
      ? `${this.baseUrl}/${this.tenant}/api/v1`
      : `${this.baseUrl}/api/v1`;
  }

  private headers(): AxiosRequestConfig['headers'] {
    return { token: this.token };
  }

  async getAlunos(pagina = 1, tamanhoPagina = 100): Promise<AlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<AlunoApiModel[]>(`${this.apiBase}/Alunos`, {
        headers: this.headers(),
        params: { Pagina: pagina, TamanhoPagina: tamanhoPagina },
      }),
    );
    return data;
  }

  // GET /alunos/{id}/responsaveis  (lowercase 'a' e 'r' conforme swagger)
  async getResponsaveisAluno(idAluno: number): Promise<ResponsavelAlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<ResponsavelAlunoApiModel[]>(
        `${this.apiBase}/alunos/${idAluno}/responsaveis`,
        { headers: this.headers() },
      ),
    );
    return data;
  }

  // GET /alunos/{id}/Matriculas — retorna array de wrappers; achata para lista plana de matrículas
  async getMatriculasAluno(idAluno: number): Promise<MatriculaAlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<MatriculasWrapperApiModel[]>(
        `${this.apiBase}/alunos/${idAluno}/Matriculas`,
        { headers: this.headers() },
      ),
    );
    return data.flatMap((w) => w.matriculas ?? []);
  }

  // GET /alunos/{id}/Lancamentos — sem filtro de data (API não suporta)
  async getLancamentosAluno(idAluno: number): Promise<LancamentoAlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<LancamentoAlunoApiModel[]>(
        `${this.apiBase}/alunos/${idAluno}/Lancamentos`,
        { headers: this.headers() },
      ),
    );
    return data;
  }

  async criarCliente(dados: {
    nome: string;
    cpf?: string;
    email?: string;
    telefone?: string;
    interesse?: string;
    observacao?: string;
  }): Promise<unknown> {
    const body: Record<string, unknown> = { nome: dados.nome };
    if (dados.cpf) body.cpf = dados.cpf;
    if (dados.interesse) body.interesse = dados.interesse;
    if (dados.observacao) body.observacao = dados.observacao;
    if (dados.email || dados.telefone) {
      const contatos: Array<{ tipo: string; valor: string }> = [];
      if (dados.email) contatos.push({ tipo: 'email', valor: dados.email });
      if (dados.telefone) contatos.push({ tipo: 'celular', valor: dados.telefone });
      body.contatos = contatos;
    }
    const { data } = await firstValueFrom(
      this.http.post(`${this.apiBase}/clientes`, body, { headers: this.headers() }),
    );
    return data;
  }

  async getAllAlunos(): Promise<AlunoApiModel[]> {
    const results: AlunoApiModel[] = [];
    let pagina = 1;
    const tamanhoPagina = 100;

    while (true) {
      const page = await this.getAlunos(pagina, tamanhoPagina);
      results.push(...page);
      if (page.length < tamanhoPagina) break;
      pagina++;
    }

    this.logger.log(`SophiA: ${results.length} alunos carregados`);
    return results;
  }
}
