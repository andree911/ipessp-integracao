import { IsIn, IsOptional, IsString } from 'class-validator';

export class AtualizarLeadDto {
  @IsOptional()
  @IsIn(['novo', 'contatado', 'agendado', 'inscrito', 'matriculado', 'perdido'])
  status?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
