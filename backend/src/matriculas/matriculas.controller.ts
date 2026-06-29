import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IaBearerGuard } from '../ia/ia.guard';
import { MatriculasService } from './matriculas.service';
import { SolicitarMatriculaDto } from './dto/solicitar-matricula.dto';

@Controller('v1/matriculas')
@UseGuards(IaBearerGuard)
export class MatriculasController {
  constructor(private readonly matriculasService: MatriculasService) {}

  @Post()
  solicitarMatricula(@Body() dto: SolicitarMatriculaDto) {
    return this.matriculasService.solicitarMatricula(dto);
  }
}
