import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { TokenAttemptTracker } from '../../common/token-attempt-tracker';

@Injectable()
export class AdminApiKeyGuard implements CanActivate {
  private readonly tracker = new TokenAttemptTracker();

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip: string = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    this.tracker.assertNotLocked(ip);

    const auth = req.headers['authorization'] ?? '';
    const key = this.config.get<string>('admin.apiKey');
    const expected = key ? `Bearer ${key}` : '';

    if (expected && this.tracker.compareConstantTime(auth, expected)) {
      this.tracker.registerSuccess(ip);
      return true;
    }

    this.tracker.registerFailure(ip);
    throw new UnauthorizedException('API Key inválida ou ausente');
  }
}
