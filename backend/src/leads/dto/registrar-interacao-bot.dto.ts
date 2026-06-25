import { IsNotEmpty, IsString } from 'class-validator';

export class RegistrarInteracaoBotDto {
  @IsNotEmpty()
  @IsString()
  telefone: string;
}
