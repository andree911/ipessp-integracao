import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import {
  AlunoApiModel,
  LancamentoAlunoApiModel,
  MatriculaAlunoApiModel,
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

  async getResponsaveisAluno(idAluno: number): Promise<ResponsavelAlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<ResponsavelAlunoApiModel[]>(
        `${this.apiBase}/Alunos/${idAluno}/Responsaveis`,
        { headers: this.headers() },
      ),
    );
    return data;
  }

  async getMatriculasAluno(idAluno: number): Promise<MatriculaAlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<MatriculaAlunoApiModel[]>(
        `${this.apiBase}/Alunos/${idAluno}/Matriculas`,
        { headers: this.headers() },
      ),
    );
    return data;
  }

  async getLancamentosAluno(
    idAluno: number,
    dataInicial: Date,
    dataFinal: Date,
    pagina = 1,
    tamanhoPagina = 100,
  ): Promise<LancamentoAlunoApiModel[]> {
    const { data } = await firstValueFrom(
      this.http.get<LancamentoAlunoApiModel[]>(
        `${this.apiBase}/Alunos/${idAluno}/Lancamentos`,
        {
          headers: this.headers(),
          params: {
            DataInicial: dataInicial.toISOString(),
            DataFinal: dataFinal.toISOString(),
            Pagina: pagina,
            TamanhoPagina: tamanhoPagina,
          },
        },
      ),
    );
    return data;
  }

  // Busca todos os alunos com paginação automática
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
