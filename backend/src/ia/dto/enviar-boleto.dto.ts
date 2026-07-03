import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class EnviarBoletoDto {
  @IsNotEmpty()
  @IsString()
  cpf: string;

  // @Type coage string→number: o n8n (chamador externo) pode mandar como string.
  @Type(() => Number)
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  codigoBoleto: number;

  @IsNotEmpty()
  @IsString()
  telefone: string;
}
