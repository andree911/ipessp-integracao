import { IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, Matches, MaxLength } from 'class-validator';

export class CriarLeadDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[\d\s()\-]{10,20}$/, { message: 'Telefone inválido' })
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  cursoInteresse?: string;

  @IsOptional()
  @IsIn(['site', 'chatbot', 'whatsapp', 'n8n', 'manual'])
  origem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacao?: string;
}
