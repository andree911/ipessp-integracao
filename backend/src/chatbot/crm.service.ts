import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { errMsg } from '../common/err.util';
import { maskTelefone } from '../common/mask.util';

export interface NovoLead {
  nome: string;
  email: string;
  telefone: string;
  cursoInteresse: string;
  observacao?: string;
}

/**
 * Registro de lead no CRM do `ipessp-core` — o mesmo `POST /crm/leads` que a
 * tool "Registrar Lead CRM" do fluxo n8n chamava, com o mesmo header
 * `x-admin-key`. O CRM continua morando lá (nutrição automática, relatórios e
 * reativação de leads pausados rodam naquele projeto); este backend só passou
 * a ser quem dispara o registro, no lugar do n8n.
 */
@Injectable()
export class CrmService {
  private readonly logger = new Logger(CrmService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Não lança: o lead já foi encaminhado às consultoras por WhatsApp antes
   * daqui, então uma indisponibilidade do core não pode virar uma mensagem de
   * erro pra quem acabou de passar os dados. O retorno diz se gravou, pro log.
   */
  async registrarLead(lead: NovoLead): Promise<{ ok: boolean }> {
    const baseUrl = this.config.get<string>('core.baseUrl');
    const apiKey = this.config.get<string>('core.apiKey');

    if (!baseUrl) {
      this.logger.warn(
        'IPESSP_CORE_URL não configurada — lead não registrado no CRM',
      );
      return { ok: false };
    }

    try {
      await firstValueFrom(
        this.http.post(
          `${baseUrl}/crm/leads`,
          {
            nome: lead.nome,
            email: lead.email,
            telefone: lead.telefone,
            cursoInteresse: lead.cursoInteresse,
            observacao: lead.observacao ?? '',
            // O opt-in não é perguntado nesta triagem (o fluxo n8n perguntava
            // antes de registrar, o que custava um turno a mais); fica false
            // até a consultora confirmar no atendimento humano.
            whatsappOptin: false,
            origem: 'chatbot',
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'x-admin-key': apiKey ?? '',
            },
            timeout: 15_000,
          },
        ),
      );
      this.logger.log(`Lead registrado no CRM: ${maskTelefone(lead.telefone)}`);
      return { ok: true };
    } catch (err: unknown) {
      this.logger.error(
        `Falha ao registrar lead no CRM (${maskTelefone(lead.telefone)}): ${errMsg(err)}`,
      );
      return { ok: false };
    }
  }
}
