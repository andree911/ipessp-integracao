import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SolicitacaoEventoDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  organizacao?: string;

  @IsNotEmpty()
  @IsString()
  descricao: string;

  @IsOptional()
  @IsString()
  tipoEvento?: string;

  @IsOptional()
  @IsString()
  dataEvento?: string;
}
