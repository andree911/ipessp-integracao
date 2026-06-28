import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import {
  AlunoApiModel,
  AlunoDetalhadoApiModel,
  ColaboradorApiModel,
  LancamentoAlunoApiModel,
  ListaChamadaItem,
  AtaNotaItem,
  NotaAlunoItem,
  MatriculaAlunoApiModel,
  MatriculasWrapperApiModel,
  ResponsavelAlunoApiModel,
  CriarResponsavelAlunoApiModel,
  CriarResponsavelAlunoRetornoApiModel,
  MatriculaInclusaoApiModel,
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
    } catch (err: any) {
      this.logger.error(`SophiA: falha na autenticação inicial — ${err.message}`);
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
    } catch (err: any) {
      if (err?.response?.status === 401) {
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

  private async put<T>(url: string, body: unknown): Promise<T> {
    try {
      const { data } = await firstValueFrom(
        this.http.put<T>(url, body, { headers: this.headers() }),
      );
      return data;
    } catch (err: any) {
      if (err?.response?.status === 401) {
        this.logger.warn('SophiA: token expirado, reautenticando...');
        await this.autenticar();
        const { data } = await firstValueFrom(
          this.http.put<T>(url, body, { headers: this.headers() }),
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
    // interesse espera enum ClienteInteresseApiModel — omitido até mapear os valores válidos
    if (dados.observacao) body.observacao = dados.observacao;
    if (dados.email || dados.telefone) {
      const contatos: Array<{ tipo: string; valor: string }> = [];
      if (dados.email) contatos.push({ tipo: 'email', valor: dados.email });
      if (dados.telefone) contatos.push({ tipo: 'celular', valor: dados.telefone });
      body.contatos = contatos;
    }
    this.logger.log(`SophiA criarCliente → body: ${JSON.stringify(body)}`);
    try {
      return await this.post<unknown>(`${this.apiBase}/clientes`, body);
    } catch (err: any) {
      const detail = err?.response?.data ?? err?.response?.status ?? err.message;
      this.logger.error(`SophiA criarCliente erro: ${JSON.stringify(detail)}`);
      throw err;
    }
  }

  async getAlunoById(id: number): Promise<AlunoDetalhadoApiModel> {
    return this.get<AlunoDetalhadoApiModel>(`${this.apiBase}/Alunos/${id}`);
  }

  async searchResponsavelByCpf(cpf: string): Promise<{ codigoAluno: number; nomeAluno: string; codigoResponsavel: number; nomeResponsavel: string; email?: string } | null> {
    const cpfLimpo = cpf.replace(/\D/g, '');
    let pagina = 1;
    const tamanhoPagina = 100;
    while (true) {
      const alunos = await this.getAlunos(pagina, tamanhoPagina);
      for (const aluno of alunos) {
        const responsaveis = await this.getResponsaveisAluno(aluno.codigo);
        const resp = responsaveis.find((r) => r.cpf?.replace(/\D/g, '') === cpfLimpo);
        if (resp) {
          return {
            codigoAluno: aluno.codigo,
            nomeAluno: aluno.nome,
            codigoResponsavel: resp.codigo,
            nomeResponsavel: resp.nome,
            email: resp.email,
          };
        }
      }
      if (alunos.length < tamanhoPagina) break;
      pagina++;
    }
    return null;
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

  async getNotas(idMatricula: number, params?: Record<string, string>): Promise<unknown> {
    return this.get<unknown>(`${this.apiBase}/alunos/Matriculas/${idMatricula}/NotasAvaliacoes`, params);
  }

  async getNotasCompleto(idMatricula: number, params?: Record<string, string>): Promise<unknown> {
    return this.get<unknown>(`${this.apiBase}/alunos/Matriculas/${idMatricula}/NotasAvaliacoesCompleto`, params);
  }

  async getFrequencia(idMatricula: number, params?: Record<string, string>): Promise<unknown> {
    return this.get<unknown>(`${this.apiBase}/alunos/Matriculas/${idMatricula}/FrequenciaCompleto`, params);
  }

  async getHorarios(idAluno: number): Promise<unknown> {
    return this.get<unknown>(`${this.apiBase}/alunos/${idAluno}/QuadrosHorarios`);
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

  async getAtaNotas(params?: Record<string, string>): Promise<AtaNotaItem[]> {
    return this.get<AtaNotaItem[]>(`${this.apiBase}/AtaNota`, params);
  }

  async getNotasAlunos(idAta: number): Promise<NotaAlunoItem[]> {
    return this.get<NotaAlunoItem[]>(`${this.apiBase}/AtaNota/${idAta}/NotaAlunos`);
  }

  async getAllAlunos(): Promise<AlunoApiModel[]> {
    // API ignora TamanhoPagina — retorna todos independente do valor.
    // Uma única chamada com limite alto traz tudo sem loop infinito.
    const alunos = await this.getAlunos(1, 9999);
    this.logger.log(`SophiA: ${alunos.length} alunos carregados`);
    return alunos;
  }

  async criarResponsavelAluno(
    idAluno: number,
    dados: CriarResponsavelAlunoApiModel,
  ): Promise<CriarResponsavelAlunoRetornoApiModel> {
    return this.post<CriarResponsavelAlunoRetornoApiModel>(
      `${this.apiBase}/alunos/${idAluno}/responsaveis`,
      dados,
    );
  }

  async vincularResponsavelFinanceiro(idAluno: number, idResponsavel: number): Promise<void> {
    await this.put<unknown>(
      `${this.apiBase}/alunos/${idAluno}/responsavelFinanceiro`,
      idResponsavel,
    );
  }

  async matricularAluno(idAluno: number, dados: MatriculaInclusaoApiModel): Promise<unknown> {
    return this.post<unknown>(`${this.apiBase}/alunos/${idAluno}/Matriculas`, dados);
  }
}
