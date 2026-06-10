import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const FormData = require('form-data');
import { RecivAuthService } from './receiv-auth.service';
import { RecivBaixa, RecivCliente, RecivContrato, RecivTitulo } from './types/receiv.types';

@Injectable()
export class RecivService {
  private readonly logger = new Logger(RecivService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly auth: RecivAuthService,
  ) {}

  private get baseUrl(): string {
    return this.config.get<string>('receiv.baseUrl')!;
  }

  // Envia dados como multipart/form-data com um campo JSON (padrão exigido pela Receiv)
  private async postFormData(path: string, fieldName: string, items: unknown[]): Promise<any> {
    const form = new FormData();
    form.append(fieldName, JSON.stringify(items));

    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl}${path}`, form, {
        headers: {
          ...this.auth.getAuthHeaders(),
          ...form.getHeaders(),
        },
      }),
    );
    return data;
  }

  async enviarClientes(clientes: RecivCliente[]): Promise<any> {
    this.logger.log(`Enviando ${clientes.length} cliente(s) ao Receiv`);
    return this.postFormData('/v2/cadastrar/clientes/', 'clientes', clientes);
  }

  async enviarContratos(contratos: RecivContrato[]): Promise<any> {
    this.logger.log(`Enviando ${contratos.length} contrato(s) ao Receiv`);
    return this.postFormData('/v2/gravaContratos/', 'contratos', contratos);
  }

  async enviarTitulos(titulos: RecivTitulo[]): Promise<any> {
    this.logger.log(`Enviando ${titulos.length} título(s) ao Receiv`);
    return this.postFormData('/v2/cadastrar/titulos/', 'titulos', titulos);
  }

  async enviarBaixas(baixas: RecivBaixa[]): Promise<any> {
    this.logger.log(`Enviando ${baixas.length} baixa(s) ao Receiv`);
    return this.postFormData('/v2/gravaBaixaTitulos/', 'titulos', baixas);
  }

  async consultarStatus(): Promise<any> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl}/v2/consultar/status`, {
        headers: this.auth.getAuthHeaders(),
      }),
    );
    return data;
  }
}
