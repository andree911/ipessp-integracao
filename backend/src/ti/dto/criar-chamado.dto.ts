import { IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CriarChamadoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  titulo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  descricao: string;

  @IsOptional()
  @IsString()
  @IsIn(['Hardware', 'Software', 'Acesso', 'Rede', 'Email', 'Outro'])
  categoria?: string;

  @IsOptional()
  @IsString()
  @IsIn(['baixa', 'media', 'alta', 'urgente'])
  prioridade?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[\d\s()\-]{10,20}$/, { message: 'Telefone inválido' })
  telefoneSolicitante: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  criadoPorNome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  setor?: string;
}
