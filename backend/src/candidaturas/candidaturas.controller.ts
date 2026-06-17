import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CandidaturasService } from './candidaturas.service';
import { CandidaturaDto } from './dto/candidatura.dto';
import { Candidatura } from './entities/candidatura.entity';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const TIPOS_PERMITIDOS = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

@Controller('v1/candidaturas')
export class CandidaturasController {
  constructor(private readonly service: CandidaturasService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_SIZE } }))
  async criar(
    @Body() dto: CandidaturaDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Candidatura> {
    if (file && !TIPOS_PERMITIDOS.includes(file.mimetype)) {
      throw new BadRequestException('Arquivo inválido. Envie um PDF ou Word (.doc/.docx).');
    }
    return this.service.criar(dto, file);
  }
}
