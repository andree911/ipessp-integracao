import { Body, Controller, Post } from '@nestjs/common';
import { PortalAlunoAuthService } from './portal-aluno-auth.service';
import { PrimeiroAcessoDto } from './dto/primeiro-acesso.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { EsqueciSenhaDto } from './dto/esqueci-senha.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';

@Controller('portal/auth')
export class PortalAlunoAuthController {
  constructor(private readonly auth: PortalAlunoAuthService) {}

  @Post('primeiro-acesso')
  primeiroAcesso(@Body() dto: PrimeiroAcessoDto) {
    return this.auth.primeiroAcesso(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refreshToken);
  }

  @Post('logout')
  logout(@Body() dto: RefreshDto) {
    return this.auth.logout(dto.refreshToken);
  }

  @Post('esqueci-senha')
  esqueciSenha(@Body() dto: EsqueciSenhaDto) {
    return this.auth.esqueciSenha(dto.ra);
  }

  @Post('redefinir-senha')
  redefinirSenha(@Body() dto: RedefinirSenhaDto) {
    return this.auth.redefinirSenha(dto.token, dto.novaSenha);
  }
}
