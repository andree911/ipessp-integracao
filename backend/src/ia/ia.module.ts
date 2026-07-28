import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { EmailModule } from '../email/email.module';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { IaBearerGuard } from './ia.guard';
import { SupabaseService } from '../common/supabase.service';
import { ResponsavelCache } from './entities/responsavel-cache.entity';
import { TelefoneCpfCache } from './entities/telefone-cpf-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResponsavelCache, TelefoneCpfCache]), SophiaModule, FinanceiroModule, EmailModule],
  controllers: [IaController],
  providers: [IaService, IaBearerGuard, SupabaseService],
  exports: [TypeOrmModule],
})
export class IaModule {}
