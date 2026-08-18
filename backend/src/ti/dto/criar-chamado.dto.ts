import { Transform } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

// n8n (via $fromAI) sempre manda string, nunca omite o campo: quando a IA não
// sabe classificar, o valor vem como "". @IsOptional() só ignora null/undefined,
// então sem esse Transform "" cairia no IsIn e voltaria 400.
const undefinedSeVazio = ({ value }: { value: string }) =>
  value === '' ? undefined : value;

export class CriarChamadoDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(300)
  titulo: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(5000)
  descricao: string;

  @Transform(undefinedSeVazio)
  @IsOptional()
  @IsString()
  @IsIn(['Hardware', 'Software', 'Acesso', 'Rede', 'Email', 'Outro'])
  categoria?: string;

  @Transform(undefinedSeVazio)
  @IsOptional()
  @IsString()
  @IsIn(['baixa', 'media', 'alta', 'urgente'])
  prioridade?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[\d\s()-]{10,20}$/, { message: 'Telefone inválido' })
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
