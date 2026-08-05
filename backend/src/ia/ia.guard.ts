import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';

interface Attempt {
  count: number;
  windowStart: number;
  lockedUntil?: number;
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_TRACKED_IPS = 5000;

// Mesmo padrão do AdminGuard (ipessp-core/src/common/admin.guard.ts): esses
// endpoints /ia e /v1/ti expõem financeiro/acadêmico por CPF, então o token
// estático sozinho, comparado direto (!==), é vulnerável a força bruta e a
// vazamento por timing.
@Injectable()
export class IaBearerGuard implements CanActivate {
  private readonly attempts = new Map<string, Attempt>();

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const ip: string = req.ip ?? req.socket?.remoteAddress ?? 'unknown';
    const now = Date.now();

    const attempt = this.attempts.get(ip);
    if (attempt?.lockedUntil && attempt.lockedUntil > now) {
      throw new HttpException(
        'Muitas tentativas com token inválido. Tente novamente mais tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const auth = req.headers['authorization'] ?? '';
    const token = this.config.get<string>('ia.bearerToken');
    const expected = token ? `Bearer ${token}` : '';

    if (expected && this.compareConstantTime(auth, expected)) {
      this.attempts.delete(ip);
      return true;
    }

    this.registerFailure(ip, attempt, now);
    throw new UnauthorizedException('Token inválido ou ausente');
  }

  private registerFailure(ip: string, attempt: Attempt | undefined, now: number): void {
    if (!attempt || now - attempt.windowStart > WINDOW_MS) {
      this.pruneStale(now);
      this.attempts.set(ip, { count: 1, windowStart: now });
      return;
    }
    attempt.count += 1;
    if (attempt.count >= MAX_ATTEMPTS) attempt.lockedUntil = now + LOCKOUT_MS;
  }

  private compareConstantTime(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  }

  private pruneStale(now: number): void {
    if (this.attempts.size < MAX_TRACKED_IPS) return;
    for (const [ip, a] of this.attempts) {
      const stale = (!a.lockedUntil || a.lockedUntil <= now) && now - a.windowStart > WINDOW_MS;
      if (stale) this.attempts.delete(ip);
    }
  }
}
