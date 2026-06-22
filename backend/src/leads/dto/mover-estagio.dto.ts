import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MoverEstagioDto {
  @IsNotEmpty()
  @IsIn(['novo', 'contatado', 'agendado', 'inscrito', 'matriculado', 'perdido'])
  estagio: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
