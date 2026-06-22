import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { AuthModule } from '../auth/auth.module';
import { LeadsModule } from '../leads/leads.module';
import { Lead } from '../leads/entities/lead.entity';
import { LeadHistorico } from '../leads/entities/lead-historico.entity';

@Module({
  imports: [
    AuthModule,
    LeadsModule,
    TypeOrmModule.forFeature([Lead, LeadHistorico]),
  ],
  controllers: [AdminController],
  providers: [AdminApiKeyGuard],
})
export class AdminModule {}
