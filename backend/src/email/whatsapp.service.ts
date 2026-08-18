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
    const enviar = () =>
      firstValueFrom(
        this.http.post(
          url,
          { phone, message: mensagem },
          {
            headers: { 'Client-Token': clientToken ?? '' },
          },
        ),
      );

    try {
      await enviar();
    } catch {
      // Retry único após um pequeno atraso: quem chama trata isso como
      // fire-and-forget (ex.: aviso de pagamento aprovado, notificar
      // consultora), sem esse retry uma instabilidade passageira da Z-API
      // perdia a notificação de vez, só com um warn no log.
      await new Promise((resolve) => setTimeout(resolve, 2000));
      try {
        await enviar();
      } catch (err2) {
        this.logger.warn(
          `WhatsApp: falha ao enviar para ${phone} (após retry) — ${detalheErro(err2)}`,
        );
      }
    }
  }

  /**
   * Envia texto + lista de opções nativa do WhatsApp (botão "Ver opções" que
   * abre uma lista dentro do próprio app — não abre link externo). Mesmo
   * formato usado pelo menu principal do chatbot Eliza (send-option-list),
   * que comprovadamente entrega — diferente do send-button-actions (URL),
   * que a Z-API aceita mas o WhatsApp não entrega em números não verificados
   * como Business API. Propaga erro — quem chama decide o fallback.
   */
  async enviarListaOpcoes(
    telefone: string,
    mensagem: string,
    tituloLista: string,
    botaoLabel: string,
    opcoes: { id: string; title: string }[],
  ): Promise<void> {
    const instanceId = this.config.get<string>('zapi.instanceId');
    const token = this.config.get<string>('zapi.token');
    const clientToken = this.config.get<string>('zapi.clientToken');

    if (!instanceId || !token) {
      throw new Error('Z-API não configurada — lista não pode ser enviada');
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-option-list`;
    const phone = telefone.replace(/\D/g, '');

    try {
      await firstValueFrom(
        this.http.post(
          url,
          {
            phone,
            message: mensagem,
            optionList: {
              title: tituloLista,
              buttonLabel: botaoLabel,
              options: opcoes,
            },
          },
          { headers: { 'Client-Token': clientToken ?? '' } },
        ),
      );
    } catch (err) {
      this.logger.warn(
        `WhatsApp: falha ao enviar lista para ${phone} — ${detalheErro(err)}`,
      );
      throw err;
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

  /** Envia uma imagem (ex.: QR code do PIX, banner de cobrança) em base64. A Z-API exige o campo `image` como data URI -- base64 cru é rejeitado com "Base64/Url could not be read". Propaga erro — quem chama decide o fallback. */
  async enviarImagem(
    telefone: string,
    base64: string,
    caption?: string,
    mimeType = 'image/png',
  ): Promise<void> {
    const instanceId = this.config.get<string>('zapi.instanceId');
    const token = this.config.get<string>('zapi.token');
    const clientToken = this.config.get<string>('zapi.clientToken');

    if (!instanceId || !token) {
      throw new Error('Z-API não configurada — imagem não pode ser enviada');
    }

    const url = `https://api.z-api.io/instances/${instanceId}/token/${token}/send-image`;
    const phone = telefone.replace(/\D/g, '');
    const dataUri = `data:${mimeType};base64,${base64}`;

    try {
      await firstValueFrom(
        this.http.post(
          url,
          { phone, image: dataUri, caption },
          { headers: { 'Client-Token': clientToken ?? '' } },
        ),
      );
    } catch (err) {
      this.logger.warn(
        `WhatsApp: falha ao enviar imagem para ${phone} — ${detalheErro(err)}`,
      );
      throw err;
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

  /** Baixa um PDF de uma URL pública (ex.: material servido pela VPS) e manda como documento. Propaga erro — quem chama decide o fallback. */
  async enviarDocumentoDeUrl(
    telefone: string,
    url: string,
    fileName: string,
  ): Promise<void> {
    const base64 = await this.baixarComoBase64(url, 'PDF');
    await this.enviarDocumento(telefone, base64, fileName, 'pdf');
  }

  /**
   * Baixa uma imagem pública (ex.: banner de cobrança) e devolve em base64,
   * pronta pra passar em enviarImagem. Pensado pra ser baixada UMA vez por
   * rodada de job e reenviada a vários destinatários — não chamar isso uma
   * vez por destinatário. Propaga erro — quem chama decide o fallback.
   */
  async baixarImagemBase64(url: string): Promise<string> {
    return this.baixarComoBase64(url, 'imagem');
  }

  private async baixarComoBase64(
    url: string,
    descricao: string,
  ): Promise<string> {
    try {
      const resposta = await firstValueFrom(
        this.http.get(url, { responseType: 'arraybuffer' }),
      );
      return Buffer.from(resposta.data as ArrayBuffer).toString('base64');
    } catch (err) {
      this.logger.warn(
        `WhatsApp: falha ao baixar ${descricao} de ${url} — ${detalheErro(err)}`,
      );
      throw err;
    }
  }
}
