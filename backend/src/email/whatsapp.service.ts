import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

/** Prioriza o corpo da resposta da Z-API (onde vem o motivo real) sobre o "Request failed with status code X" genérico do axios. */
function detalheErro(err: unknown): string {
  const axiosErr = err as { response?: { data?: unknown }; message?: string };
  const data = axiosErr?.response?.data;
  if (data !== undefined) {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }
  return axiosErr?.message ?? String(err);
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async enviarTexto(telefone: string, mensagem: string): Promise<void> {
    const instanceId = this.config.get<string>('zapi.instanceId');
    const token = this.config.get<string>('zapi.token');
    const clientToken = this.config.get<string>('zapi.clientToken');

    if (!instanceId || !token) {
      this.logger.warn('Z-API não configurada — mensagem não enviada');
      return;
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`;
    const phone = telefone.replace(/\D/g, '');

    try {
      await firstValueFrom(
        this.http.post(
          url,
          { phone, message: mensagem },
          {
            headers: { 'Client-Token': clientToken ?? '' },
          },
        ),
      );
    } catch (err) {
      this.logger.warn(
        `WhatsApp: falha ao enviar para ${phone} — ${detalheErro(err)}`,
      );
    }
  }

  /** Consulta se a sessão do WhatsApp está de fato pareada na Z-API (independe de qualquer envio). */
  async verificarConexao(): Promise<{
    connected: boolean;
    smartphoneConnected?: boolean;
    error?: string;
  }> {
    const instanceId = this.config.get<string>('zapi.instanceId');
    const token = this.config.get<string>('zapi.token');
    const clientToken = this.config.get<string>('zapi.clientToken');

    if (!instanceId || !token) {
      return { connected: false, error: 'Z-API não configurada' };
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/status`;

    try {
      const resposta = await firstValueFrom(
        this.http.get<{ connected: boolean; smartphoneConnected?: boolean }>(
          url,
          { headers: { 'Client-Token': clientToken ?? '' } },
        ),
      );
      return resposta.data;
    } catch (err) {
      return { connected: false, error: detalheErro(err) };
    }
  }

  /** Envia um documento (ex.: PDF de boleto) em base64. Propaga erro — quem chama decide o fallback. */
  async enviarDocumento(
    telefone: string,
    base64: string,
    fileName: string,
    extensao = 'pdf',
  ): Promise<void> {
    const instanceId = this.config.get<string>('zapi.instanceId');
    const token = this.config.get<string>('zapi.token');
    const clientToken = this.config.get<string>('zapi.clientToken');

    if (!instanceId || !token) {
      throw new Error('Z-API não configurada — documento não pode ser enviado');
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-document/${extensao}`;
    const phone = telefone.replace(/\D/g, '');

    try {
      await firstValueFrom(
        this.http.post(
          url,
          { phone, document: base64, fileName },
          {
            headers: { 'Client-Token': clientToken ?? '' },
          },
        ),
      );
    } catch (err) {
      this.logger.warn(
        `WhatsApp: falha ao enviar documento para ${phone} — ${detalheErro(err)}`,
      );
      throw err;
    }
  }
}
