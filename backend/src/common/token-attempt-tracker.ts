import { HttpException, HttpStatus } from '@nestjs/common';
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

/**
 * Comparação constant-time de token estático com lockout por IP após tentativas
 * inválidas repetidas. Usado por guards que autenticam com um único token/API key
 * fixo (sem usuário/senha por trás), onde comparação direta (!==) é vulnerável a
 * timing attack e força bruta sem limite.
 */
export class TokenAttemptTracker {
  private readonly attempts = new Map<string, Attempt>();

  assertNotLocked(ip: string, now = Date.now()): void {
    const attempt = this.attempts.get(ip);
    if (attempt?.lockedUntil && attempt.lockedUntil > now) {
      throw new HttpException(
        'Muitas tentativas com token inválido. Tente novamente mais tarde.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  registerSuccess(ip: string): void {
    this.attempts.delete(ip);
  }

  registerFailure(ip: string, now = Date.now()): void {
    const attempt = this.attempts.get(ip);
    if (!attempt || now - attempt.windowStart > WINDOW_MS) {
      this.pruneStale(now);
      this.attempts.set(ip, { count: 1, windowStart: now });
      return;
    }
    attempt.count += 1;
    if (attempt.count >= MAX_ATTEMPTS) attempt.lockedUntil = now + LOCKOUT_MS;
  }

  compareConstantTime(a: string, b: string): boolean {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
  }

  private pruneStale(now: number): void {
    if (this.attempts.size < MAX_TRACKED_IPS) return;
    for (const [ip, a] of this.attempts) {
      const stale =
        (!a.lockedUntil || a.lockedUntil <= now) &&
        now - a.windowStart > WINDOW_MS;
      if (stale) this.attempts.delete(ip);
    }
  }
}
