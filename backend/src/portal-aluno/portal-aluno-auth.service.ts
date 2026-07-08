import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { PortalAlunoRefreshToken } from './entities/portal-aluno-refresh-token.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { SophiaService } from '../sophia/sophia.service';
import { LoginDto } from './dto/login.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

interface Sessao {
  ra: string;
  codigoSophia: number;
  nome: string;
}

@Injectable()
export class PortalAlunoAuthService {
  constructor(
    @InjectRepository(PortalAlunoRefreshToken)
    private readonly refreshRepo: Repository<PortalAlunoRefreshToken>,
    @InjectRepository(ClienteCache)
    private readonly clienteRepo: Repository<ClienteCache>,
    private readonly sophia: SophiaService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const ra = dto.ra.trim();
    const cliente = await this.clienteRepo.findOne({ where: { ra } });
    if (!cliente || !cliente.codigoSophia) {
      throw new UnauthorizedException('RA ou senha inválidos.');
    }

    let resultado: { acessoValido: boolean };
    try {
      resultado = await this.sophia.validarLogin({ codigo: ra, senha: dto.senha });
    } catch {
      throw new UnauthorizedException('Não foi possível validar seu login agora. Tente novamente em instantes.');
    }
    if (!resultado.acessoValido) {
      throw new UnauthorizedException('RA ou senha inválidos.');
    }

    return this.emitirSessao({ ra, codigoSophia: cliente.codigoSophia, nome: cliente.nomeAluno });
  }

  async refresh(refreshTokenRaw: string) {
    const tokenHash = this.hashToken(refreshTokenRaw);
    const registro = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (!registro || registro.expiraEm < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    await this.refreshRepo.delete(registro.id);
    return this.emitirSessao({ ra: registro.ra, codigoSophia: registro.codigoSophia, nome: registro.nome });
  }

  async logout(refreshTokenRaw: string) {
    await this.refreshRepo.delete({ tokenHash: this.hashToken(refreshTokenRaw) });
    return { ok: true };
  }

  private async emitirSessao(sessao: Sessao) {
    const accessToken = jwt.sign(
      { codigoSophia: sessao.codigoSophia, ra: sessao.ra, nome: sessao.nome },
      this.config.get<string>('jwt.secret')!,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshTokenRaw = randomBytes(32).toString('hex');
    await this.refreshRepo.save(
      this.refreshRepo.create({
        ra: sessao.ra,
        codigoSophia: sessao.codigoSophia,
        nome: sessao.nome,
        tokenHash: this.hashToken(refreshTokenRaw),
        expiraEm: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      }),
    );

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      aluno: { nome: sessao.nome, ra: sessao.ra },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
