import { forwardRef, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { EmailModule } from '../email/email.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { IaModule } from '../ia/ia.module';
import { ChatbotService } from './chatbot.service';
import { ChatbotIaService } from './chatbot-ia.service';
import { ChatbotSessaoStore } from './chatbot-sessao.store';
import { CrmService } from './crm.service';

/**
 * `forwardRef` nos dois lados porque o ciclo é real e intencional: o chatbot
 * precisa do `WhatsAppService` (EmailModule) pra responder, e o
 * `WhatsAppWebhookController` (também EmailModule) precisa do ChatbotService
 * pra processar a mensagem que chega da Z-API. Quebrar isso exigiria extrair
 * o WhatsAppService pra um módulo próprio, mexendo em código que hoje
 * funciona — não vale pelo ganho.
 */
@Module({
  imports: [
    HttpModule,
    forwardRef(() => EmailModule),
    FinanceiroModule,
    IaModule,
  ],
  providers: [ChatbotService, ChatbotIaService, ChatbotSessaoStore, CrmService],
  exports: [ChatbotService],
})
export class ChatbotModule {}
