import {
  BadRequestException,
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { PortalAlunoDadosService } from './portal-aluno-dados.service';
import { PortalAlunoGuard, PortalAlunoRequestUser } from './portal-aluno.guard';
import { assinaturaValida } from '../common/file-signature.util';

type RequestComPortalAluno = Request & { portalAluno: PortalAlunoRequestUser };

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@UseGuards(PortalAlunoGuard)
@Controller('portal/me')
export class PortalAlunoDadosController {
  constructor(private readonly dados: PortalAlunoDadosService) {}

  @Get()
  perfil(@Req() req: RequestComPortalAluno) {
    return { ra: req.portalAluno.ra, nome: req.portalAluno.nome };
  }

  @Get('financeiro')
  financeiro(@Req() req: RequestComPortalAluno) {
    return this.dados.meuFinanceiro(req.portalAluno.codigoSophia);
  }

  @Get('curso')
  curso(@Req() req: RequestComPortalAluno) {
    return this.dados.meuCurso(req.portalAluno.codigoSophia);
  }

  @Get('notas')
  notas(
    @Req() req: RequestComPortalAluno,
    @Query('matricula', ParseIntPipe) matricula: number,
  ) {
    return this.dados.minhasNotas(req.portalAluno.codigoSophia, matricula);
  }

  @Get('frequencia')
  frequencia(
    @Req() req: RequestComPortalAluno,
    @Query('matricula', ParseIntPipe) matricula: number,
  ) {
    return this.dados.minhaFrequencia(req.portalAluno.codigoSophia, matricula);
  }

  @Get('horario')
  horario(
    @Req() req: RequestComPortalAluno,
    @Query('matricula', ParseIntPipe) matricula: number,
  ) {
    return this.dados.meuHorario(req.portalAluno.codigoSophia, matricula);
  }

  @Post('documentos')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE } }))
  async enviarDocumento(
    @Req() req: RequestComPortalAluno,
    @Body('descricao') descricao: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Envie um arquivo.');
    if (!assinaturaValida(file.buffer, TIPOS_PERMITIDOS)) {
      throw new BadRequestException(
        'Arquivo inválido. Envie PDF, imagem (JPG/PNG) ou Word (.doc/.docx).',
      );
    }
    if (!descricao)
      throw new BadRequestException('Informe a descrição do documento.');
    return this.dados.enviarDocumento(
      req.portalAluno.codigoSophia,
      descricao,
      file,
    );
  }
}
