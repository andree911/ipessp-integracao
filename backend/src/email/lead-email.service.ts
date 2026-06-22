import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { EmailService } from './email.service';
import { EmailLog } from './entities/email-log.entity';
import { Lead } from '../leads/entities/lead.entity';

@Injectable()
export class LeadEmailService {
  private readonly logger = new Logger(LeadEmailService.name);

  constructor(
    @InjectRepository(EmailLog) private readonly logRepo: Repository<EmailLog>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    private readonly emailService: EmailService,
  ) {}

  async enviarBoasVindas(lead: Lead): Promise<void> {
    if (!lead.email) return;
    const jaEnviado = await this.logRepo.findOne({ where: { leadId: lead.id, tipo: 'lead_boas_vindas' } });
    if (jaEnviado) return;

    const html = this.templateBoasVindas(lead.nome, lead.cursoInteresse);
    try {
      await this.emailService.enviar(lead.email, 'Bem-vindo(a) ao IPESSP — seu futuro começa aqui!', html);
      await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, tipo: 'lead_boas_vindas', destinatario: lead.email, enviado: true });
      this.logger.log(`Boas-vindas enviado para lead #${lead.id} (${lead.email})`);
    } catch (err: any) {
      await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, tipo: 'lead_boas_vindas', destinatario: lead.email, enviado: false, erro: err.message });
      this.logger.warn(`Erro ao enviar boas-vindas para lead #${lead.id}: ${err.message}`);
    }
  }

  @Cron('0 9 * * *')
  async processarSequencia(): Promise<void> {
    const agora = new Date();

    // Dia 2: follow-up
    const limite2Dias = new Date(agora.getTime() - 2 * 24 * 60 * 60 * 1000);
    const limite3Dias = new Date(agora.getTime() - 3 * 24 * 60 * 60 * 1000);

    const leadsDia2 = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.email IS NOT NULL')
      .andWhere('l.status NOT IN (:...finais)', { finais: ['inscrito', 'matriculado', 'perdido'] })
      .andWhere('l.criadoEm >= :de AND l.criadoEm < :ate', { de: limite3Dias, ate: limite2Dias })
      .getMany();

    for (const lead of leadsDia2) {
      const jaEnviado = await this.logRepo.findOne({ where: { leadId: lead.id, tipo: 'lead_followup' } });
      if (jaEnviado) continue;
      const html = this.templateFollowUp(lead.nome, lead.cursoInteresse);
      try {
        await this.emailService.enviar(lead.email!, 'Ainda pensando? Podemos ajudar — IPESSP', html);
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, tipo: 'lead_followup', destinatario: lead.email!, enviado: true });
        this.logger.log(`Follow-up enviado para lead #${lead.id}`);
      } catch (err: any) {
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, tipo: 'lead_followup', destinatario: lead.email!, enviado: false, erro: err.message });
      }
    }

    // Dia 5: CTA
    const limite5Dias = new Date(agora.getTime() - 5 * 24 * 60 * 60 * 1000);
    const limite6Dias = new Date(agora.getTime() - 6 * 24 * 60 * 60 * 1000);

    const leadsDia5 = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.email IS NOT NULL')
      .andWhere('l.status NOT IN (:...finais)', { finais: ['inscrito', 'matriculado', 'perdido'] })
      .andWhere('l.criadoEm >= :de AND l.criadoEm < :ate', { de: limite6Dias, ate: limite5Dias })
      .getMany();

    for (const lead of leadsDia5) {
      const jaEnviado = await this.logRepo.findOne({ where: { leadId: lead.id, tipo: 'lead_cta' } });
      if (jaEnviado) continue;
      const html = this.templateCta(lead.nome, lead.cursoInteresse);
      try {
        await this.emailService.enviar(lead.email!, 'Última chamada: inscrições abertas no IPESSP', html);
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, tipo: 'lead_cta', destinatario: lead.email!, enviado: true });
        this.logger.log(`CTA enviado para lead #${lead.id}`);
      } catch (err: any) {
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, tipo: 'lead_cta', destinatario: lead.email!, enviado: false, erro: err.message });
      }
    }
  }

  // ─── Templates ───────────────────────────────────────────────────────────────

  private templateBoasVindas(nome: string, curso?: string): string {
    const cursoTexto = curso ? ` no curso <strong>${curso}</strong>` : '';
    return `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <tr><td style="background:#C8102E;padding:32px 40px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700">IPESSP</h1>
    <p style="color:rgba(255,255,255,.85);margin:8px 0 0;font-size:14px">Instituto de Pesquisa e Ensino Superior de São Paulo</p>
  </td></tr>
  <tr><td style="padding:40px">
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px">Olá, ${nome}! 👋</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 16px">Ficamos muito felizes com seu interesse${cursoTexto} no IPESSP. Nossa equipe já foi notificada e entrará em contato em breve.</p>
    <p style="color:#444;line-height:1.7;margin:0 0 24px">Enquanto isso, que tal conhecer mais sobre nossos cursos e estrutura?</p>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#C8102E;border-radius:6px">
      <a href="https://ipessp.edu.br" style="display:block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px">Ver nossos cursos</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:24px 40px;text-align:center;border-top:1px solid #eeeeee">
    <p style="color:#999;font-size:12px;margin:0">IPESSP · São Paulo, SP · contato@ipessp.edu.br</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
  }

  private templateFollowUp(nome: string, curso?: string): string {
    const cursoTexto = curso ? `sobre o curso <strong>${curso}</strong>` : 'sobre nossos cursos';
    return `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <tr><td style="background:#C8102E;padding:28px 40px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700">IPESSP</h1>
  </td></tr>
  <tr><td style="padding:40px">
    <h2 style="color:#1a1a1a;font-size:19px;margin:0 0 16px">Ainda com dúvidas, ${nome}?</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 16px">Notamos que você demonstrou interesse ${cursoTexto}. Nossa equipe está pronta para responder todas as suas perguntas sobre processo seletivo, valores e estrutura.</p>
    <p style="color:#444;line-height:1.7;margin:0 0 24px">Fale conosco pelo WhatsApp — é rápido e sem compromisso!</p>
    <table cellpadding="0" cellspacing="0"><tr><td style="background:#25D366;border-radius:6px">
      <a href="https://wa.me/5511XXXXXXXXX" style="display:block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px">Falar pelo WhatsApp</a>
    </td></tr></table>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee">
    <p style="color:#999;font-size:12px;margin:0">IPESSP · contato@ipessp.edu.br</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
  }

  private templateCta(nome: string, curso?: string): string {
    const cursoTexto = curso ? ` para o curso de ${curso}` : '';
    return `
<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 16px">
<table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08)">
  <tr><td style="background:#C8102E;padding:28px 40px;text-align:center">
    <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700">IPESSP</h1>
    <p style="color:rgba(255,255,255,.85);margin:6px 0 0;font-size:13px">⏰ Vagas limitadas</p>
  </td></tr>
  <tr><td style="padding:40px">
    <h2 style="color:#1a1a1a;font-size:19px;margin:0 0 16px">${nome}, as inscrições estão abertas!</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 16px">As vagas${cursoTexto} estão preenchendo rapidamente. Garanta a sua agora e dê o próximo passo na sua carreira com o suporte de um dos melhores institutos de São Paulo.</p>
    <table cellpadding="0" cellspacing="0" style="margin-bottom:16px"><tr><td style="background:#C8102E;border-radius:6px">
      <a href="https://ipessp.edu.br/inscricao" style="display:block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px">Fazer minha inscrição agora</a>
    </td></tr></table>
    <p style="color:#888;font-size:13px;margin:0">Dúvidas? Responda este e-mail ou fale conosco no WhatsApp.</p>
  </td></tr>
  <tr><td style="background:#f8f8f8;padding:20px 40px;text-align:center;border-top:1px solid #eeeeee">
    <p style="color:#999;font-size:12px;margin:0">IPESSP · contato@ipessp.edu.br</p>
  </td></tr>
</table>
</td></tr></table></body></html>`;
  }
}
