import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  ra: string;

  @IsNotEmpty()
  @IsString()
  senha: string;
}
