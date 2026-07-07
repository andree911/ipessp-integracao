import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RedefinirSenhaDto {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  novaSenha: string;
}
