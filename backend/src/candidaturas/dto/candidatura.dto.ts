import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CandidaturaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  area: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  mensagem?: string;
}
