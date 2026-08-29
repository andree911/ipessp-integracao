import { forwardRef, Module } from '@nestjs/common';
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
import { ChatbotModule } from '../chatbot/chatbot.module';

// ChatbotModule com forwardRef: o WhatsAppWebhookController daqui despacha a
// mensagem recebida pro ChatbotService, que por sua vez responde usando o
// WhatsAppService deste módulo -- ver o comentário em ChatbotModule.
@Module({
  imports: [
    TypeOrmModule.forFeature([EmailLog, LancamentoCache, ClienteCache]),
    HttpModule,
    SophiaModule,
    FinanceiroModule,
    forwardRef(() => ChatbotModule),
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
