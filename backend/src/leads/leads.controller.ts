import { Body, Controller, Get, Param, Patch, Post, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CriarLeadDto } from './dto/criar-lead.dto';
import { AtualizarLeadDto } from './dto/atualizar-lead.dto';
import { MoverEstagioDto } from './dto/mover-estagio.dto';
import { RegistrarInteracaoBotDto } from './dto/registrar-interacao-bot.dto';
import { IaBearerGuard } from '../ia/ia.guard';

@Controller('v1/leads')
@UseGuards(IaBearerGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  criar(@Body() dto: CriarLeadDto) {
    return this.leadsService.criar(dto);
  }

  @Get('relatorio')
  relatorio() {
    return this.leadsService.relatorio();
  }

  @Get('relatorio/diario')
  relatorioDiario() {
    return this.leadsService.relatorioDiario();
  }

  @Get('prontos-para-contato')
  listarProntosParaContato() {
    return this.leadsService.listarProntosParaContato();
  }

  @Post('registrar-interacao-bot')
  registrarInteracaoBot(@Body() dto: RegistrarInteracaoBotDto) {
    return this.leadsService.registrarInteracaoBot(dto.telefone);
  }

  @Post('reativar-nurturing')
  reativarNurturing() {
    return this.leadsService.reativarNurturingPausado();
  }

  @Get()
  listar(
    @Query('status') status?: string,
    @Query('origem') origem?: string,
    @Query('telefone') telefone?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadsService.listar({
      status, origem, telefone, de, ate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get(':id')
  buscarPorId(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.buscarPorId(id);
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

  @Patch(':id/nurturing-avanco')
  avancarNurturing(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.avancarNurturing(id);
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
