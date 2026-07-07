import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PortalAlunoDadosService } from './portal-aluno-dados.service';
import { PortalAlunoGuard, PortalAlunoRequestUser } from './portal-aluno.guard';

type RequestComPortalAluno = Request & { portalAluno: PortalAlunoRequestUser };

@UseGuards(PortalAlunoGuard)
@Controller('portal/me')
export class PortalAlunoDadosController {
  constructor(private readonly dados: PortalAlunoDadosService) {}

  @Get()
  perfil(@Req() req: RequestComPortalAluno) {
    return { ra: req.portalAluno.ra };
  }

  @Get('financeiro')
  financeiro(@Req() req: RequestComPortalAluno) {
    return this.dados.meuFinanceiro(req.portalAluno.codigoSophia);
  }

  @Get('curso')
  curso(@Req() req: RequestComPortalAluno) {
    return this.dados.meuCurso(req.portalAluno.codigoSophia);
  }
}
