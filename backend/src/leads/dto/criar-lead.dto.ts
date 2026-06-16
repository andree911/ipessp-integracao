import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn } from 'class-validator';

export class CriarLeadDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsString()
  cursoInteresse?: string;

  @IsOptional()
  @IsIn(['site', 'chatbot', 'whatsapp', 'n8n', 'manual'])
  origem?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
