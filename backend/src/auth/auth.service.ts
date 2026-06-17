import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { randomBytes, createHash } from 'crypto';
import { Usuario } from './entities/usuario.entity';
import { Professor } from './entities/professor.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { ResetToken } from './entities/reset-token.entity';
import { EmailService } from '../email/email.service';
import {
  RegisterAlunoDto,
  RegisterProfessorDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';

const BCRYPT_ROUNDS = 12;
const JWT_TTL = '15m';
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const RESET_TTL_MS = 60 * 60 * 1000;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Professor) private readonly professorRepo: Repository<Professor>,
    @InjectRepository(RefreshToken) private readonly refreshRepo: Repository<RefreshToken>,
    @InjectRepository(ResetToken) private readonly resetRepo: Repository<ResetToken>,
    private readonly config: ConfigService,
    private readonly email: EmailService,
  ) {}

  private get jwtSecret() {
    return this.config.get<string>('jwt.secret')!;
  }

  private signJwt(payload: { sub: string; nome: string; tipo: string }) {
    return jwt.sign(payload, this.jwtSecret, { expiresIn: JWT_TTL });
  }

  private async createRefreshToken(usuarioId: string) {
    const raw = randomBytes(40).toString('hex');
    const tokenHash = createHash('sha256').update(raw).digest('hex');
    const expiraEm = new Date(Date.now() + REFRESH_TTL_MS);
    await this.refreshRepo.save({ usuarioId, tokenHash, expiraEm });
    return { raw, expiraEm };
  }

  async registerAluno(dto: RegisterAlunoDto) {
    const exists = await this.usuarioRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('email já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_ROUNDS);
    await this.usuarioRepo.save({
      email: dto.email.toLowerCase(),
      senhaHash,
      tipo: 'aluno',
      nome: dto.nome,
      ativo: true,
    });
    return { ok: true };
  }

  async registerProfessor(dto: RegisterProfessorDto) {
    const exists = await this.usuarioRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (exists) throw new ConflictException('email já cadastrado');

    const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_ROUNDS);
    const usuario = await this.usuarioRepo.save({
      email: dto.email.toLowerCase(),
      senhaHash,
      tipo: 'professor',
      nome: dto.nome,
      ativo: false,
    });

    await this.professorRepo.save({
      usuarioId: usuario.id,
      matricula: dto.matricula ?? null,
      telefone: dto.telefone ?? null,
    });

    return { ok: true, pendente_validacao: true };
  }

  async login(dto: LoginDto, res: any) {
    const usuario = await this.usuarioRepo.findOne({ where: { email: dto.email.toLowerCase() } });
    if (!usuario) throw new UnauthorizedException('credenciais inválidas');
    if (!usuario.ativo) throw new ForbiddenException('conta pendente de validação');

    const ok = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!ok) throw new UnauthorizedException('credenciais inválidas');

    const token = this.signJwt({ sub: usuario.id, nome: usuario.nome, tipo: usuario.tipo });
    const { raw, expiraEm } = await this.createRefreshToken(usuario.id);

    res.cookie('refresh_token', raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/v1/auth/refresh',
      expires: expiraEm,
    });

    return { token, tipo: usuario.tipo, nome: usuario.nome };
  }

  async refresh(rawRefreshToken: string | undefined, res: any) {
    if (!rawRefreshToken) throw new UnauthorizedException('sem refresh token');

    const tokenHash = createHash('sha256').update(rawRefreshToken).digest('hex');
    const stored = await this.refreshRepo.findOne({
      where: { tokenHash, expiraEm: MoreThan(new Date()) },
    });
    if (!stored) throw new UnauthorizedException('refresh token inválido ou expirado');

    await this.refreshRepo.delete(stored.id);

    const usuario = await this.usuarioRepo.findOne({ where: { id: stored.usuarioId } });
    if (!usuario || !usuario.ativo) throw new ForbiddenException('conta desativada');

    const token = this.signJwt({ sub: usuario.id, nome: usuario.nome, tipo: usuario.tipo });
    const { raw, expiraEm } = await this.createRefreshToken(usuario.id);

    res.cookie('refresh_token', raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/v1/auth/refresh',
      expires: expiraEm,
    });

    return { token };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { email: dto.email.toLowerCase(), ativo: true },
    });
    // Responde sempre ok para não vazar se email existe
    if (!usuario) return { ok: true };

    const token = randomBytes(32).toString('hex');
    const expiraEm = new Date(Date.now() + RESET_TTL_MS);
    await this.resetRepo.save({ usuarioId: usuario.id, token, expiraEm });

    const siteUrl = this.config.get<string>('jwt.siteUrl');
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    try {
      await this.email.enviar(
        dto.email,
        'Redefinição de senha — IPESSP',
        `<p>Olá, ${usuario.nome}.</p>
         <p>Clique no link abaixo para redefinir sua senha (válido por 1 hora):</p>
         <p><a href="${resetUrl}">${resetUrl}</a></p>`,
      );
    } catch { /* não expõe falha de email */ }

    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const stored = await this.resetRepo.findOne({
      where: { token: dto.token, usado: false, expiraEm: MoreThan(new Date()) },
    });
    if (!stored) throw new UnauthorizedException('token inválido ou expirado');

    const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_ROUNDS);
    await this.usuarioRepo.update(stored.usuarioId, { senhaHash });
    await this.resetRepo.update(stored.id, { usado: true });

    return { ok: true };
  }

  async me(usuarioId: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id: usuarioId } });
    if (!usuario) throw new NotFoundException('usuário não encontrado');
    return { id: usuario.id, nome: usuario.nome, email: usuario.email, tipo: usuario.tipo };
  }
}
