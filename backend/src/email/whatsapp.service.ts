import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

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
        `WhatsApp: falha ao enviar para ${phone} — ${(err as Error).message}`,
      );
    }
  }

  /**
   * Envia texto com um botão nativo do WhatsApp (link). Se a Z-API não estiver
   * configurada, cai em silêncio (mesmo comportamento de enviarTexto) — quem
   * chama não precisa tratar esse caso à parte.
   */
  async enviarBotaoLink(
    telefone: string,
    mensagem: string,
    botaoLabel: string,
    url: string,
  ): Promise<void> {
    const instanceId = this.config.get<string>('zapi.instanceId');
    const token = this.config.get<string>('zapi.token');
    const clientToken = this.config.get<string>('zapi.clientToken');

    if (!instanceId || !token) {
      this.logger.warn('Z-API não configurada — mensagem não enviada');
      return;
    }

    const endpoint = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-button-actions`;
    const phone = telefone.replace(/\D/g, '');

    try {
      await firstValueFrom(
        this.http.post(
          endpoint,
          {
            phone,
            message: mensagem,
            buttonActions: [{ id: '1', type: 'URL', url, label: botaoLabel }],
          },
          { headers: { 'Client-Token': clientToken ?? '' } },
        ),
      );
    } catch (err) {
      this.logger.warn(
        `WhatsApp: falha ao enviar botão para ${phone} — ${(err as Error).message}`,
      );
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
        `WhatsApp: falha ao enviar documento para ${phone} — ${(err as Error).message}`,
      );
      throw err;
    }
  }
}
