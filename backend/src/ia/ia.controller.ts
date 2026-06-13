import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IaBearerGuard } from './ia.guard';
import { IaService } from './ia.service';
import { CriarProspectivoDto } from './dto/prospectivo.dto';

@Controller('ia')
@UseGuards(IaBearerGuard)
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Get('financeiro')
  getFinanceiro(@Query('cpf') cpf: string) {
    if (!cpf) throw new BadRequestException('Parâmetro cpf é obrigatório');
    return this.iaService.getFinanceiroByCpf(cpf);
  }

  @Get('avisos')
  getAvisos() {
    return this.iaService.getAvisos();
  }

  @Get('calendario')
  getCalendario() {
    return this.iaService.getCalendario();
  }

  @Post('prospectivo')
  criarProspectivo(@Body() dto: CriarProspectivoDto) {
    return this.iaService.criarProspectivo(dto);
  }
}
