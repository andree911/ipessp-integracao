import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { LeadsModule } from '../leads/leads.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { EmailModule } from '../email/email.module';
import { SophiaModule } from '../sophia/sophia.module';
import { Lead } from '../leads/entities/lead.entity';
import { LeadHistorico } from '../leads/entities/lead-historico.entity';

@Module({
  imports: [
    LeadsModule,
    FinanceiroModule,
    EmailModule,
    SophiaModule,
    TypeOrmModule.forFeature([Lead, LeadHistorico]),
  ],
  controllers: [AdminController],
  providers: [AdminApiKeyGuard],
})
export class AdminModule {}
