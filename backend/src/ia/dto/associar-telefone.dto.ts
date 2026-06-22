import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class AssociarTelefoneDto {
  @IsNotEmpty()
  @IsString()
  telefone: string;

  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  nomeResponsavel?: string;
}
