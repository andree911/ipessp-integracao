import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class EnviarPdfCursoDto {
  // @Type coage string→number: o n8n (chamador externo) pode mandar como string.
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  codigoCurso: number;

  @IsNotEmpty()
  @IsString()
  telefone: string;
}
