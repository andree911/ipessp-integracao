import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class AlunoDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  @IsOptional()
  @IsIn(['M', 'F'])
  sexo?: 'M' | 'F';

  // YYYY-MM-DD
  @IsOptional()
  @IsString()
  dataNascimento?: string;
}

export class ResponsavelDto {
  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsNotEmpty()
  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefone?: string;

  // 1=Mãe, 2=Pai, 3=Outros
  @IsOptional()
  @IsInt()
  @IsIn([1, 2, 3])
  tipoParentesco?: 1 | 2 | 3;
}

export class CursoDto {
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
}

export class PlanoPagamentoDto {
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  numeroParcelas: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  valorParcela: number;

  // YYYY-MM-DD
  @IsNotEmpty()
  @IsString()
  dataPrimeiraParcela: string;

  @IsOptional()
  @IsString()
  desconto?: string;
}

export class SolicitarMatriculaDto {
  @ValidateNested()
  @Type(() => AlunoDto)
  aluno: AlunoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResponsavelDto)
  responsavel?: ResponsavelDto;

  @ValidateNested()
  @Type(() => CursoDto)
  curso: CursoDto;

  @ValidateNested()
  @Type(() => PlanoPagamentoDto)
  planoPagamento: PlanoPagamentoDto;

  @IsOptional()
  @IsString()
  observacao?: string;
}
