import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { PortalAlunoConta } from './entities/portal-aluno-conta.entity';
import { PortalAlunoRefreshToken } from './entities/portal-aluno-refresh-token.entity';
import { PortalAlunoResetToken } from './entities/portal-aluno-reset-token.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { SophiaService } from '../sophia/sophia.service';
import { EmailService } from '../email/email.service';
import { PrimeiroAcessoDto } from './dto/primeiro-acesso.dto';
import { LoginDto } from './dto/login.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class PortalAlunoAuthService {
  constructor(
    @InjectRepository(PortalAlunoConta)
    private readonly contaRepo: Repository<PortalAlunoConta>,
    @InjectRepository(PortalAlunoRefreshToken)
    private readonly refreshRepo: Repository<PortalAlunoRefreshToken>,
    @InjectRepository(PortalAlunoResetToken)
    private readonly resetRepo: Repository<PortalAlunoResetToken>,
    @InjectRepository(ClienteCache)
    private readonly clienteRepo: Repository<ClienteCache>,
    private readonly sophia: SophiaService,
    private readonly email: EmailService,
    private readonly config: ConfigService,
  ) {}

  async primeiroAcesso(dto: PrimeiroAcessoDto) {
    const ra = dto.ra.trim();
    const cpfLimpo = dto.cpf.replace(/\D/g, '');

    const cliente = await this.clienteRepo.findOne({ where: { ra } });
    if (!cliente) {
      throw new NotFoundException('RA não encontrado. Verifique o número ou entre em contato com a secretaria.');
    }
    const codigoSophia = cliente.codigoSophia;
    if (!codigoSophia) {
      throw new NotFoundException('Aluno sem código Sophia associado. Entre em contato com a secretaria.');
    }
    if ((cliente.cpf ?? '').replace(/\D/g, '') !== cpfLimpo) {
      throw new UnauthorizedException('CPF não confere com o RA informado.');
    }

    const existente = await this.contaRepo.findOne({ where: { ra } });
    if (existente) {
      throw new ConflictException('Já existe uma conta pra esse RA. Faça login ou use "Esqueci minha senha".');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const conta = await this.contaRepo.save(
      this.contaRepo.create({ ra, codigoSophia, nome: cliente.nomeAluno, senhaHash }),
    );

    return this.emitirSessao(conta);
  }

  async login(dto: LoginDto) {
    const conta = await this.contaRepo.findOne({ where: { ra: dto.ra.trim() } });
    if (!conta) throw new UnauthorizedException('RA ou senha inválidos.');

    const senhaOk = await bcrypt.compare(dto.senha, conta.senhaHash);
    if (!senhaOk) throw new UnauthorizedException('RA ou senha inválidos.');

    return this.emitirSessao(conta);
  }

  async refresh(refreshTokenRaw: string) {
    const tokenHash = this.hashToken(refreshTokenRaw);
    const registro = await this.refreshRepo.findOne({ where: { tokenHash } });
    if (!registro || registro.expiraEm < new Date()) {
      throw new UnauthorizedException('Sessão expirada. Faça login novamente.');
    }

    const conta = await this.contaRepo.findOne({ where: { id: registro.contaId } });
    if (!conta) throw new UnauthorizedException('Sessão inválida.');

    await this.refreshRepo.delete(registro.id);
    return this.emitirSessao(conta);
  }

  async logout(refreshTokenRaw: string) {
    await this.refreshRepo.delete({ tokenHash: this.hashToken(refreshTokenRaw) });
    return { ok: true };
  }

  /** Nunca revela se o RA existe — evita enumeração de contas. */
  async esqueciSenha(ra: string) {
    const conta = await this.contaRepo.findOne({ where: { ra: ra.trim() } });
    if (!conta) return { ok: true };

    let email: string | undefined;
    try {
      const aluno = await this.sophia.getAlunoById(conta.codigoSophia);
      email = aluno.email;
    } catch {
      email = undefined;
    }
    if (!email) return { ok: true };

    const tokenRaw = randomBytes(32).toString('hex');
    await this.resetRepo.save(
      this.resetRepo.create({
        contaId: conta.id,
        tokenHash: this.hashToken(tokenRaw),
        expiraEm: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      }),
    );

    const link = `${this.config.get<string>('jwt.siteUrl')}/portal-do-aluno/redefinir-senha?token=${tokenRaw}`;
    await this.email.enviar(
      email,
      'Redefinição de senha — Portal do Aluno',
      `<p>Olá, ${conta.nome}!</p>` +
        `<p>Clique no link abaixo para redefinir sua senha do Portal do Aluno. Este link expira em 1 hora.</p>` +
        `<p><a href="${link}">${link}</a></p>` +
        `<p>Se você não pediu essa redefinição, ignore este e-mail.</p>`,
    );

    return { ok: true };
  }

  async redefinirSenha(tokenRaw: string, novaSenha: string) {
    const tokenHash = this.hashToken(tokenRaw);
    const registro = await this.resetRepo.findOne({ where: { tokenHash } });
    if (!registro || registro.usadoEm || registro.expiraEm < new Date()) {
      throw new UnauthorizedException('Link de redefinição inválido ou expirado.');
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.contaRepo.update(registro.contaId, { senhaHash });
    await this.resetRepo.update(registro.id, { usadoEm: new Date() });

    // Revoga todas as sessões ativas dessa conta.
    await this.refreshRepo.delete({ contaId: registro.contaId });

    return { ok: true };
  }

  private async emitirSessao(conta: PortalAlunoConta) {
    const accessToken = jwt.sign(
      { contaId: conta.id, codigoSophia: conta.codigoSophia, ra: conta.ra },
      this.config.get<string>('jwt.secret')!,
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshTokenRaw = randomBytes(32).toString('hex');
    await this.refreshRepo.save(
      this.refreshRepo.create({
        contaId: conta.id,
        tokenHash: this.hashToken(refreshTokenRaw),
        expiraEm: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      }),
    );

    return {
      accessToken,
      refreshToken: refreshTokenRaw,
      aluno: { nome: conta.nome, ra: conta.ra },
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
