import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString, IsIn, Matches, MaxLength } from 'class-validator';

// n8n (via $fromAI) sempre manda string, nunca omite o campo: quando a IA não
// tem a informação, o valor vem como "". @IsOptional() só ignora null/undefined,
// então sem esse Transform "" cairia nos validadores de formato e voltaria 400.
const undefinedSeVazio = ({ value }: { value: string }) => (value === '' ? undefined : value);

export class CriarLeadDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  nome: string;

  @Transform(undefinedSeVazio)
  @IsOptional()
  @IsEmail()
  email?: string;

  @Transform(undefinedSeVazio)
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^\+?[\d\s()\-]{10,20}$/, { message: 'Telefone inválido' })
  telefone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  cursoInteresse?: string;

  @IsOptional()
  @IsBoolean()
  whatsappOptin?: boolean;

  @IsOptional()
  @IsIn(['site', 'chatbot', 'whatsapp', 'n8n', 'manual'])
  origem?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  observacao?: string;
}
