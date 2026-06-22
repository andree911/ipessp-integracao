import { Body, Controller, Get, Param, Patch, Post, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CriarLeadDto } from './dto/criar-lead.dto';
import { AtualizarLeadDto } from './dto/atualizar-lead.dto';
import { MoverEstagioDto } from './dto/mover-estagio.dto';
import { IaBearerGuard } from '../ia/ia.guard';

@Controller('v1/leads')
@UseGuards(IaBearerGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  criar(@Body() dto: CriarLeadDto) {
    return this.leadsService.criar(dto);
  }

  @Get()
  listar(
    @Query('status') status?: string,
    @Query('origem') origem?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ) {
    return this.leadsService.listar({ status, origem, de, ate });
  }

  @Get('relatorio')
  relatorio() {
    return this.leadsService.relatorio();
  }

  @Get(':id/historico')
  getHistorico(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.getHistorico(id);
  }

  @Patch(':id/estagio')
  moverEstagio(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MoverEstagioDto,
  ) {
    return this.leadsService.moverEstagio(id, dto);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarLeadDto) {
    return this.leadsService.atualizar(id, dto);
  }

  @Patch(':id/vincular-aluno')
  vincularAluno(
    @Param('id', ParseIntPipe) id: number,
    @Body('codigoAluno', ParseIntPipe) codigoAluno: number,
  ) {
    return this.leadsService.vincularAluno(id, codigoAluno);
  }
}
