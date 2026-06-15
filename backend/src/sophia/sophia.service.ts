import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
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
    await this.autenticar();
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
  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<T>(url, { headers: this.headers(), params }),
      );
      return data;
    } catch (err: any) {
      if (err?.response?.status === 401) {
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

  async getAlunos(pagina = 1, tamanhoPagina = 100): Promise<AlunoApiModel[]> {
    return this.get<AlunoApiModel[]>(`${this.apiBase}/Alunos`, {
      Pagina: pagina,
      TamanhoPagina: tamanhoPagina,
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
    return data.flatMap((w) => w.matriculas ?? []);
  }

  async getLancamentosAluno(idAluno: number): Promise<LancamentoAlunoApiModel[]> {
    return this.get<LancamentoAlunoApiModel[]>(
      `${this.apiBase}/alunos/${idAluno}/Lancamentos`,
    );
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
