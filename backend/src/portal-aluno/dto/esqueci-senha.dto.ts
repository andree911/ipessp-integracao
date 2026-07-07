import { IsNotEmpty, IsString } from 'class-validator';

export class EsqueciSenhaDto {
  @IsNotEmpty()
  @IsString()
  ra: string;
}
