import { IsEmail, IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ManifestacaoDto {
  @IsNotEmpty()
  @IsIn(['reclamacao', 'sugestao', 'elogio', 'outro'])
  tipo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  mensagem: string;
}
