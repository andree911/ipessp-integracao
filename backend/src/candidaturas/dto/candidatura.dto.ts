import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CandidaturaDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  area: string;

  @IsOptional()
  @IsString()
  mensagem?: string;
}
