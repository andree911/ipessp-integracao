import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { CandidaturasService } from './candidaturas.service';
import { CandidaturaDto } from './dto/candidatura.dto';
import { Candidatura } from './entities/candidatura.entity';

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const TIPOS_PERMITIDOS = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

@Controller('v1/candidaturas')
@UseGuards(ThrottlerGuard)
@Throttle({ default: { limit: 5, ttl: 60000 } })
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
