import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async enviarTexto(telefone: string, mensagem: string): Promise<void> {
    const apiUrl = this.config.get<string>('evolution.apiUrl');
    const apiKey = this.config.get<string>('evolution.apiKey');
    const instance = this.config.get<string>('evolution.instanceFinanceiro');

    if (!apiUrl || !apiKey || !instance) {
      this.logger.warn('Evolution API não configurada — mensagem não enviada');
      return;
    }

    const url = `${apiUrl}/message/sendText/${instance}`;
    const phone = telefone.replace(/\D/g, '');

    try {
      await firstValueFrom(
        this.http.post(
          url,
          { number: phone, textMessage: { text: mensagem } },
          { headers: { apikey: apiKey } },
        ),
      );
    } catch (err) {
      this.logger.warn(`WhatsApp: falha ao enviar para ${phone} — ${(err as Error).message}`);
    }
  }

  /** Envia um documento (ex.: PDF de boleto) em base64. Propaga erro — quem chama decide o fallback. */
  async enviarDocumento(telefone: string, base64: string, fileName: string, extensao = 'pdf'): Promise<void> {
    const apiUrl = this.config.get<string>('evolution.apiUrl');
    const apiKey = this.config.get<string>('evolution.apiKey');
    const instance = this.config.get<string>('evolution.instanceFinanceiro');

    if (!apiUrl || !apiKey || !instance) {
      throw new Error('Evolution API não configurada — documento não pode ser enviado');
    }

    const url = `${apiUrl}/message/sendMedia/${instance}`;
    const phone = telefone.replace(/\D/g, '');

    // Evolution API exige multipart/form-data no envio de mídia — diferente do
    // Z-API, que aceitava o arquivo em base64 dentro de um JSON.
    const form = new FormData();
    form.append('number', phone);
    form.append('mediatype', 'document');
    form.append('fileName', fileName);
    form.append('media', Buffer.from(base64, 'base64'), {
      filename: fileName,
      contentType: extensao === 'pdf' ? 'application/pdf' : undefined,
    });

    try {
      await firstValueFrom(
        this.http.post(url, form, {
          headers: { apikey: apiKey, ...form.getHeaders() },
        }),
      );
    } catch (err) {
      this.logger.warn(`WhatsApp: falha ao enviar documento para ${phone} — ${(err as Error).message}`);
      throw err;
    }
  }
}
