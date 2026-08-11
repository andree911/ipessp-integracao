import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class EncaminharHumanoDto {
  @IsIn(['financeiro', 'secretaria'])
  setor: 'financeiro' | 'secretaria';

  @IsNotEmpty()
  @IsString()
  telefone: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(2000)
  resumo: string;
}
