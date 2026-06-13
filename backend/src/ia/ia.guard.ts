import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class IaBearerGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'] ?? '';
    const token = this.config.get<string>('ia.bearerToken');

    if (!token || !auth || auth !== `Bearer ${token}`) {
      throw new UnauthorizedException('Token inválido ou ausente');
    }
    return true;
  }
}
