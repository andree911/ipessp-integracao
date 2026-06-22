import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailLog } from './entities/email-log.entity';
import { Lead } from '../leads/entities/lead.entity';

const SITE_URL = 'https://ipessp.edu.br';
const COR = '#C8102E';

const REDES = [
  { letra: 'ig', nome: 'Instagram', url: 'https://www.instagram.com/ipessp/' },
  { letra: 'in', nome: 'LinkedIn',  url: 'https://www.linkedin.com/company/ipessp---educa-o/' },
  { letra: 'f',  nome: 'Facebook',  url: 'https://www.facebook.com/ipesspedu/' },
  { letra: 'yt', nome: 'YouTube',   url: 'https://www.youtube.com/channel/UC7dgP6NBgM9L0m11UbhCyHg' },
];

@Injectable()
export class LeadEmailService {
  private readonly logger = new Logger(LeadEmailService.name);
  private readonly logoUrl: string;

  constructor(
    @InjectRepository(EmailLog) private readonly logRepo: Repository<EmailLog>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {
    this.logoUrl = this.config.get<string>('EMAIL_LOGO_URL') ?? '';
  }

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

  private cabecalhoHtml(subtitulo?: string): string {
    const logoBlock = this.logoUrl
      ? `<a href="${SITE_URL}" target="_blank" style="display:inline-block;line-height:0;border:0;text-decoration:none;">
           <img src="${this.logoUrl}" alt="IPESSP" height="56"
             style="height:56px;width:auto;display:block;border:0;border-radius:50%;">
         </a>`
      : `<span style="font-size:24px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">IPESSP</span>`;

    return `
  <tr>
    <td bgcolor="#C8102E" style="background-color:#C8102E;padding:28px 40px;text-align:center;">
      ${logoBlock}
      ${subtitulo ? `<p style="color:rgba(255,255,255,.85);margin:10px 0 0;font-size:13px;font-family:Arial,sans-serif;">${subtitulo}</p>` : ''}
    </td>
  </tr>`;
  }

  private redesSociaisHtml(): string {
    return `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 16px;">
      <tr>
        ${REDES.map(({ letra, nome, url }) => {
          const fs = letra.length > 1 ? 11 : 16;
          const inset = letra.length > 1 ? 11 : 9;
          return `
        <td style="padding:0 6px;text-align:center;">
          <a href="${url}" target="_blank" style="text-decoration:none;">
            <!--[if mso]><v:oval xmlns:v="urn:schemas-microsoft-com:vml" style="width:36px;height:36px;" fillcolor="${COR}" stroked="false"><v:textbox inset="0,${inset}px,0,0" style="mso-fit-shape-to-text:false;"><center><span style="font-family:Arial;font-size:${fs}px;font-weight:bold;color:#ffffff;">${letra}</span></center></v:textbox></v:oval><![endif]-->
            <!--[if !mso]><!--><span style="display:inline-block;width:36px;height:36px;background:${COR};border-radius:50%;text-align:center;line-height:36px;font-size:${fs}px;font-weight:bold;color:#ffffff;font-family:Arial,sans-serif;">${letra}</span><!--<![endif]-->
          </a>
          <p style="margin:4px 0 0;font-size:9px;color:#aaa;font-family:Arial,sans-serif;">${nome}</p>
        </td>`;
        }).join('')}
      </tr>
    </table>`;
  }

  private rodapeHtml(): string {
    const logoBlock = this.logoUrl
      ? `<a href="${SITE_URL}" target="_blank" style="display:inline-block;line-height:0;border:0;text-decoration:none;margin-bottom:16px;">
           <img src="${this.logoUrl}" alt="IPESSP" height="40"
             style="height:40px;width:auto;display:block;border:0;border-radius:50%;">
         </a>`
      : `<span style="font-size:16px;font-weight:bold;color:#888;font-family:Arial,sans-serif;display:block;margin-bottom:16px;">IPESSP</span>`;

    return `
  <tr>
    <td bgcolor="#f8f8f8" style="background-color:#f8f8f8;padding:28px 40px;text-align:center;border-top:1px solid #eeeeee;">
      ${logoBlock}
      ${this.redesSociaisHtml()}
      <p style="color:#aaa;font-size:11px;margin:0;font-family:Arial,sans-serif;">
        IPESSP &middot; S&atilde;o Paulo, SP &middot;
        <a href="mailto:contato@ipessp.edu.br" style="color:#aaa;text-decoration:none;">contato@ipessp.edu.br</a>
      </p>
    </td>
  </tr>`;
  }

  private wrapEmail(conteudo: string, subtitulo?: string): string {
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr><td align="center" style="padding:40px 16px;">
    <table width="580" cellpadding="0" cellspacing="0" border="0"
      style="background:#ffffff;border-radius:8px;overflow:hidden;">
      ${this.cabecalhoHtml(subtitulo)}
      <tr><td style="padding:40px;">${conteudo}</td></tr>
      ${this.rodapeHtml()}
    </table>
  </td></tr>
</table>
</body></html>`;
  }

  private templateBoasVindas(nome: string, curso?: string): string {
    const cursoTexto = curso ? ` no curso <strong>${curso}</strong>` : '';
    return this.wrapEmail(`
    <h2 style="color:#1a1a1a;font-size:20px;margin:0 0 16px;font-family:Arial,sans-serif;">Ol&aacute;, ${nome}! &#128075;</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 16px;font-family:Arial,sans-serif;">Ficamos muito felizes com seu interesse${cursoTexto} no IPESSP. Nossa equipe j&aacute; foi notificada e entrar&aacute; em contato em breve.</p>
    <p style="color:#444;line-height:1.7;margin:0 0 24px;font-family:Arial,sans-serif;">Enquanto isso, que tal conhecer mais sobre nossos cursos e estrutura?</p>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td bgcolor="#C8102E" style="background-color:#C8102E;border-radius:6px;">
        <a href="${SITE_URL}" target="_blank"
          style="display:block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;font-family:Arial,sans-serif;">
          Ver nossos cursos
        </a>
      </td></tr>
    </table>`);
  }

  private templateFollowUp(nome: string, curso?: string): string {
    const cursoTexto = curso ? `sobre o curso <strong>${curso}</strong>` : 'sobre nossos cursos';
    return this.wrapEmail(`
    <h2 style="color:#1a1a1a;font-size:19px;margin:0 0 16px;font-family:Arial,sans-serif;">Ainda com d&uacute;vidas, ${nome}?</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 16px;font-family:Arial,sans-serif;">Notamos que voc&ecirc; demonstrou interesse ${cursoTexto}. Nossa equipe est&aacute; pronta para responder todas as suas perguntas sobre processo seletivo, valores e estrutura.</p>
    <p style="color:#444;line-height:1.7;margin:0 0 24px;font-family:Arial,sans-serif;">Fale conosco pelo WhatsApp &mdash; &eacute; r&aacute;pido e sem compromisso!</p>
    <table cellpadding="0" cellspacing="0" border="0">
      <tr><td bgcolor="#25D366" style="background-color:#25D366;border-radius:6px;">
        <a href="https://wa.me/5511976922127" target="_blank"
          style="display:block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;font-family:Arial,sans-serif;">
          Falar pelo WhatsApp
        </a>
      </td></tr>
    </table>`);
  }

  private templateCta(nome: string, curso?: string): string {
    const cursoTexto = curso ? ` para o curso de ${curso}` : '';
    return this.wrapEmail(`
    <h2 style="color:#1a1a1a;font-size:19px;margin:0 0 16px;font-family:Arial,sans-serif;">${nome}, as inscri&ccedil;&otilde;es est&atilde;o abertas!</h2>
    <p style="color:#444;line-height:1.7;margin:0 0 16px;font-family:Arial,sans-serif;">As vagas${cursoTexto} est&atilde;o preenchendo rapidamente. Garanta a sua agora e d&ecirc; o pr&oacute;ximo passo na sua carreira com o suporte de um dos melhores institutos de S&atilde;o Paulo.</p>
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:16px;">
      <tr><td bgcolor="#C8102E" style="background-color:#C8102E;border-radius:6px;">
        <a href="${SITE_URL}/inscricao" target="_blank"
          style="display:block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:14px 32px;font-family:Arial,sans-serif;">
          Fazer minha inscri&ccedil;&atilde;o agora
        </a>
      </td></tr>
    </table>
    <p style="color:#888;font-size:13px;margin:0;font-family:Arial,sans-serif;">D&uacute;vidas? Responda este e-mail ou fale conosco no WhatsApp.</p>`,
    '&#9200; Vagas limitadas');
  }
}
