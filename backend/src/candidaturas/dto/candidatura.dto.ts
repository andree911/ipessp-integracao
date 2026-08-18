import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const AREAS_CANDIDATURA = [
  'monitoria',
  'docencia',
  'laboratorio',
  'administrativo',
  'outro',
] as const;

export class CandidaturaDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @IsEmail()
  email: string;

  @IsIn(AREAS_CANDIDATURA)
  area: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  mensagem?: string;
}
