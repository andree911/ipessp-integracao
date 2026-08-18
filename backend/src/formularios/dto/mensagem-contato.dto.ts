import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class MensagemContatoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[\d\s()-]{10,20}$/, { message: 'Telefone inválido' })
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  assunto?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  mensagem: string;
}
