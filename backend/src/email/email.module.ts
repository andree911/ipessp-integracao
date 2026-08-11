import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';
import { EmailJobService } from './email-job.service';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppJobService } from './whatsapp-job.service';
import { EmailController } from './email.controller';
import { EmailLog } from './entities/email-log.entity';
import { LancamentoCache } from '../financeiro/entities/lancamento-cache.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { AdminApiKeyGuard } from '../admin/guards/admin-api-key.guard';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, LancamentoCache, ClienteCache]), HttpModule, SophiaModule, FinanceiroModule],
  controllers: [EmailController],
  providers: [EmailService, EmailJobService, WhatsAppService, WhatsAppJobService, AdminApiKeyGuard],
  exports: [EmailService, EmailJobService, WhatsAppService],
})
export class EmailModule {}
