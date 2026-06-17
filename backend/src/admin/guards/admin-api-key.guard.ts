import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'] ?? '';
    const key = this.config.get<string>('admin.apiKey');

    if (!key || !auth || auth !== `Bearer ${key}`) {
      throw new UnauthorizedException('API Key inválida ou ausente');
    }
    return true;
  }
}
