import { IsIn, IsOptional, IsString } from 'class-validator';

export class AtualizarLeadDto {
  @IsOptional()
  @IsIn(['novo', 'contatado', 'convertido', 'perdido'])
  status?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
