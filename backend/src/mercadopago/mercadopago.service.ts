import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPago, { Preference, Payment } from 'mercadopago';

export interface CriarPreferenciaDto {
  titulo: string;
  valorParcela: number;
  numeroParcelas: number;
  referenciaExterna: string;
  pagador: {
    nome: string;
    email?: string;
    cpf?: string;
    telefone?: string;
  };
}

export interface PreferenciaResult {
  preferenceId: string;
  linkPagamento: string;
  linkSandbox: string;
}

@Injectable()
export class MercadoPagoService implements OnModuleInit {
  private readonly logger = new Logger(MercadoPagoService.name);
  private client: MercadoPago;
  private sandbox: boolean;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const accessToken = this.config.get<string>('mercadopago.accessToken');
    if (!accessToken) {
      this.logger.warn('MP_ACCESS_TOKEN não configurado — integração Mercado Pago desativada');
      return;
    }
    this.sandbox = this.config.get<boolean>('mercadopago.sandbox') ?? true;
    this.client = new MercadoPago({ accessToken });
    this.logger.log(`Mercado Pago inicializado (${this.sandbox ? 'sandbox' : 'produção'})`);
  }

  async criarPreferencia(dto: CriarPreferenciaDto): Promise<PreferenciaResult> {
    if (!this.client) {
      throw new Error('Mercado Pago não está configurado (MP_ACCESS_TOKEN ausente)');
    }

    const preference = new Preference(this.client);

    const [primeiroNome, ...resto] = dto.pagador.nome.trim().split(' ');
    const sobrenome = resto.join(' ') || primeiroNome;

    const telefoneNumeros = dto.pagador.telefone?.replace(/\D/g, '') ?? '';

    const result = await preference.create({
      body: {
        items: [
          {
            id: dto.referenciaExterna,
            title: dto.titulo,
            quantity: 1,
            unit_price: dto.valorParcela,
            currency_id: 'BRL',
          },
        ],
        payer: {
          name: primeiroNome,
          surname: sobrenome,
          ...(dto.pagador.email && { email: dto.pagador.email }),
          ...(dto.pagador.cpf && {
            identification: { type: 'CPF', number: dto.pagador.cpf.replace(/\D/g, '') },
          }),
          ...(telefoneNumeros && {
            phone: {
              area_code: telefoneNumeros.slice(0, 2),
              number: telefoneNumeros.slice(2),
            },
          }),
        },
        payment_methods: {
          installments: dto.numeroParcelas,
        },
        external_reference: dto.referenciaExterna,
        // back_urls e auto_return só incluídos quando successUrl está configurado;
        // a API do MP rejeita back_urls com campos undefined ou auto_return sem success
        ...(this.config.get<string>('mercadopago.successUrl') && {
          back_urls: {
            success: this.config.get<string>('mercadopago.successUrl')!,
            ...(this.config.get<string>('mercadopago.failureUrl') && {
              failure: this.config.get<string>('mercadopago.failureUrl')!,
            }),
            ...(this.config.get<string>('mercadopago.pendingUrl') && {
              pending: this.config.get<string>('mercadopago.pendingUrl')!,
            }),
          },
          auto_return: 'approved' as const,
        }),
        ...(this.config.get<string>('mercadopago.notificationUrl') && {
          notification_url: this.config.get<string>('mercadopago.notificationUrl'),
        }),
      },
    });

    this.logger.log(`Preferência MP criada: ${result.id} | ref: ${dto.referenciaExterna}`);

    return {
      preferenceId: result.id ?? '',
      linkPagamento: result.init_point ?? '',
      linkSandbox: result.sandbox_init_point ?? '',
    };
  }

  async buscarPagamento(paymentId: string) {
    if (!this.client) throw new Error('Mercado Pago não configurado');
    const payment = new Payment(this.client);
    return payment.get({ id: paymentId });
  }
}
