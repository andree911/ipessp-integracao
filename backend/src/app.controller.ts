import { Controller, Get, Header } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderComoPagarPage } from './como-pagar.template';

@Controller()
export class AppController {
  constructor(private readonly config: ConfigService) {}

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }

  @Get('como-pagar')
  @Header('Content-Type', 'text/html; charset=utf-8')
  comoPagar(): string {
    const portalUrl = this.config.get<string>('email.linkPortalAluno') || '#';
    return renderComoPagarPage(portalUrl);
  }
}
