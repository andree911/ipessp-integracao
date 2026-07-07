import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class PrimeiroAcessoDto {
  @IsNotEmpty()
  @IsString()
  ra: string;

  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  senha: string;
}
