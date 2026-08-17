import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

export interface PortalAlunoRequestUser {
  codigoSophia: number;
  ra: string;
  nome: string;
}

@Injectable()
export class PortalAlunoGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers['authorization'] ?? '';
    const [scheme, token] = auth.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Token inválido ou ausente');
    }

    try {
      const payload = jwt.verify(
        token,
        this.config.get<string>('jwt.secret')!,
      ) as PortalAlunoRequestUser;
      (req as Request & { portalAluno: PortalAlunoRequestUser }).portalAluno = {
        codigoSophia: payload.codigoSophia,
        ra: payload.ra,
        nome: payload.nome,
      };
      return true;
    } catch {
      throw new UnauthorizedException('Sessão expirada ou inválida');
    }
  }
}
