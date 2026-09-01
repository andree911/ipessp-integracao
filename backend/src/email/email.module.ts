import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EmailService } from './email.service';
import { EmailJobService } from './email-job.service';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppJobService } from './whatsapp-job.service';
import { EmailController } from './email.controller';
import { WhatsAppWebhookController } from './whatsapp-webhook.controller';
import { EmailLog } from './entities/email-log.entity';
import { LancamentoCache } from '../financeiro/entities/lancamento-cache.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { AdminApiKeyGuard } from '../admin/guards/admin-api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([EmailLog, LancamentoCache, ClienteCache]),
    // Sem timeout, uma chamada à Z-API que trava (sem erro, sem resposta) nunca
    // rejeita -- o retry do WhatsAppService.enviarTexto/enviarImagem/etc. só
    // dispara em catch, então a rodada inteira do cron de cobrança fica presa
    // no aluno atual pra sempre. Mesmo padrão do SophiaModule (timeout: 15000).
    HttpModule.register({ timeout: 20000 }),
    SophiaModule,
    FinanceiroModule,
  ],
  controllers: [EmailController, WhatsAppWebhookController],
  providers: [
    EmailService,
    EmailJobService,
    WhatsAppService,
    WhatsAppJobService,
    AdminApiKeyGuard,
  ],
  exports: [EmailService, EmailJobService, WhatsAppService],
})
export class EmailModule {}
