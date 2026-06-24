import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CriarChamadoDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
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
  telefoneSolicitante: string;

  @IsOptional()
  @IsString()
  criadoPorNome?: string;

  @IsOptional()
  @IsString()
  setor?: string;
}
