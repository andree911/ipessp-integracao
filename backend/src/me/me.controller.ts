import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MeService } from './me.service';
import { JwtAuthGuard, JwtPayload } from '../auth/guards/jwt-auth.guard';

type AuthReq = Request & { user: JwtPayload };

@Controller('v1/me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private readonly meService: MeService) {}

  @Get('academico')
  getAcademico(@Req() req: AuthReq) {
    return this.meService.getAcademico(req.user.sub);
  }

  @Get('financeiro')
  getFinanceiro(@Req() req: AuthReq) {
    return this.meService.getFinanceiro(req.user.sub);
  }

  @Get('matriculas')
  getMatriculas(@Req() req: AuthReq) {
    return this.meService.getMatriculas(req.user.sub);
  }

  @Get('matriculas/:id/notas')
  getNotas(
    @Req() req: AuthReq,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: Record<string, string>,
  ) {
    return this.meService.getNotas(req.user.sub, id, query);
  }

  @Get('matriculas/:id/frequencia')
  getFrequencia(
    @Req() req: AuthReq,
    @Param('id', ParseIntPipe) id: number,
    @Query() query: Record<string, string>,
  ) {
    return this.meService.getFrequencia(req.user.sub, id, query);
  }

  @Get('horarios')
  getHorarios(@Req() req: AuthReq) {
    return this.meService.getHorarios(req.user.sub);
  }

  @Get('boleto/:codigo')
  async getBoleto(
    @Req() req: AuthReq,
    @Param('codigo') codigo: string,
    @Res() res: Response,
  ) {
    const pdf = await this.meService.getBoleto(req.user.sub, codigo);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="boleto-${codigo}.pdf"`);
    res.send(pdf);
  }

  @Get('turmas')
  getTurmas(@Req() req: AuthReq, @Query() query: Record<string, string>) {
    return this.meService.getTurmas(req.user.sub, query);
  }

  @Get('turmas/:id/alunos')
  getAlunosTurma(@Req() req: AuthReq, @Param('id', ParseIntPipe) id: number) {
    return this.meService.getAlunosTurma(req.user.sub, id);
  }

  @Get('ata-notas')
  getAtaNotas(@Req() req: AuthReq, @Query() query: Record<string, string>) {
    return this.meService.getAtaNotas(req.user.sub, query);
  }

  @Get('ata-notas/:id/notas')
  getNotasAta(@Req() req: AuthReq, @Param('id', ParseIntPipe) id: number) {
    return this.meService.getNotasAta(req.user.sub, id);
  }
}
