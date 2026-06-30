import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';
import { EmailJobService } from './email-job.service';
import { LeadEmailService } from './lead-email.service';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppJobService } from './whatsapp-job.service';
import { EmailController } from './email.controller';
import { EmailLog } from './entities/email-log.entity';
import { Lead } from '../leads/entities/lead.entity';
import { LancamentoCache } from '../financeiro/entities/lancamento-cache.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, Lead, LancamentoCache, ClienteCache]), HttpModule, SophiaModule, FinanceiroModule],
  controllers: [EmailController],
  providers: [EmailService, EmailJobService, LeadEmailService, WhatsAppService, WhatsAppJobService],
  exports: [EmailService, EmailJobService, LeadEmailService, WhatsAppService],
})
export class EmailModule {}
