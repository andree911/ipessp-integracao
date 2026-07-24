import { IsOptional, IsString } from 'class-validator';

export class ReatribuirLeadDto {
  @IsOptional()
  @IsString()
  observacao?: string;
}
