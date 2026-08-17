import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { TiService } from './ti.service';
import { CriarChamadoDto } from './dto/criar-chamado.dto';
import { IaBearerGuard } from '../ia/ia.guard';

@Controller('v1/ti')
@UseGuards(ThrottlerGuard, IaBearerGuard)
export class TiController {
  constructor(private readonly tiService: TiService) {}

  @Post('chamados')
  criarChamado(@Body() dto: CriarChamadoDto) {
    return this.tiService.criarChamado(dto);
  }

  @Get('chamados')
  listarPorTelefone(@Query('telefone') telefone: string) {
    if (!telefone)
      throw new BadRequestException('Parâmetro telefone é obrigatório');
    return this.tiService.listarPorTelefone(telefone);
  }
}
