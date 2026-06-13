import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
  @IsString()
  interesse?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
