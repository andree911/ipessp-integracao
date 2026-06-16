import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ManifestacaoDto {
  @IsNotEmpty()
  @IsIn(['reclamacao', 'sugestao', 'elogio', 'outro'])
  tipo: string;

  @IsNotEmpty()
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  mensagem: string;
}
