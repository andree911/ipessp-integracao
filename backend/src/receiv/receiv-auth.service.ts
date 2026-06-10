import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class RecivAuthService {
  private readonly logger = new Logger(RecivAuthService.name);

  constructor(private readonly config: ConfigService) {}

  // Gera um JWT de curta duração (30s) para cada chamada à API Receiv.
  // A Receiv valida o JWT diretamente no header Authorization — não há endpoint de troca de token.
  generateBearer(): string {
    const secret = this.config.get<string>('receiv.jwtSecret')!;
    const iss = this.config.get<string>('receiv.jwtIss')!;
    const ist = this.config.get<string>('receiv.jwtIst')!;

    const now = Math.floor(Date.now() / 1000);

    const payload = {
      iss,
      ist,
      iat: now,
      exp: now + 30,
      jti: `nonce_${now}`,
    };

    return jwt.sign(payload, secret, { algorithm: 'HS256' });
  }

  getAuthHeaders(): Record<string, string> {
    return { Authorization: `Bearer ${this.generateBearer()}` };
  }
}
