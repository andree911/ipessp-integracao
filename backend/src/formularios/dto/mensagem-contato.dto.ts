import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class MensagemContatoDto {
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
  assunto?: string;

  @IsNotEmpty()
  @IsString()
  mensagem: string;
}
