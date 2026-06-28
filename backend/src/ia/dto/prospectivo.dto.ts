import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarProspectivoDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  sexo?: 'M' | 'F';

  @IsOptional()
  @IsString()
  observacao?: string;
}
