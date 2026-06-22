import { IsInt, IsNotEmpty, IsOptional, IsString, IsBoolean, IsIn } from 'class-validator';

export class CriarResponsavelDto {
  @IsNotEmpty()
  @IsString()
  cpfAluno: string;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsOptional()
  @IsString()
  cpf?: string;

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

  @IsOptional()
  @IsBoolean()
  responsavelFinanceiro?: boolean;

  @IsOptional()
  @IsBoolean()
  responsavelPedagogico?: boolean;
}
