import { IsInt, IsNotEmpty, IsOptional, IsString, IsNumber, Min } from 'class-validator';

export class MatricularAlunoDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  codigoAluno: number;

  @IsNotEmpty()
  @IsString()
  unidade: string;

  @IsNotEmpty()
  @IsString()
  curso: string;

  @IsNotEmpty()
  @IsString()
  turno: string;

  @IsNotEmpty()
  @IsString()
  periodoLetivo: string;

  @IsOptional()
  @IsString()
  curriculo?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  valorPrimeiraParcela?: number;

  // ISO date-time: "2025-01-15T00:00:00"
  @IsOptional()
  @IsString()
  dataPagamento?: string;

  @IsOptional()
  @IsString()
  descontoMensalidade?: string;
}
