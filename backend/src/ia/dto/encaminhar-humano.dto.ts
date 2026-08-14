import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EncaminharHumanoDto {
  // 'comercial' = quem ainda não é aluno e quer se matricular; cai nas
  // consultoras de marketing (ver IaService.encaminharHumano).
  @IsIn(['financeiro', 'secretaria', 'comercial'])
  setor: 'financeiro' | 'secretaria' | 'comercial';

  @IsNotEmpty()
  @IsString()
  telefone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  resumo: string;
}
