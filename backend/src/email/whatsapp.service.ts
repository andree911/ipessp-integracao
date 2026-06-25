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

    await firstValueFrom(
      this.http.post(url, { phone, message: mensagem }, {
        headers: { 'Client-Token': clientToken ?? '' },
      }),
    );
  }
}
