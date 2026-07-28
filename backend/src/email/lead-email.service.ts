import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { errMsg } from '../common/err.util';
import { SupabaseService } from '../common/supabase.service';
import { EmailService } from './email.service';
import { EmailLog } from './entities/email-log.entity';
import { Lead } from '../leads/entities/lead.entity';
import { baseConteudoLivre, botaoCta, MarcaEmailData } from './templates/email.templates';

const SITE_URL_FALLBACK = 'https://ipessp.edu.br';
const WHATSAPP_EQUIPE_URL = 'https://wa.me/5511976922127';
const COR_WHATSAPP = '#25D366';

@Injectable()
export class LeadEmailService {
  private readonly logger = new Logger(LeadEmailService.name);

  constructor(
    @InjectRepository(EmailLog) private readonly logRepo: Repository<EmailLog>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly supabase: SupabaseService,
  ) {}

  async enviarBoasVindas(lead: Lead): Promise<void> {
    if (!lead.email) return;
    const jaEnviado = await this.logRepo.findOne({ where: { leadId: lead.id, tipo: 'lead_boas_vindas' } });
    if (jaEnviado) return;

    const urlCurso = await this.buscarUrlCurso(lead.codigoCurso);
    const html = this.templateBoasVindas(lead.nome, lead.cursoInteresse, urlCurso);
    try {
      await this.emailService.enviar(lead.email, 'Bem-vindo(a) ao IPESSP — seu futuro começa aqui!', html);
      await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, nome: lead.nome, tipo: 'lead_boas_vindas', destinatario: lead.email, enviado: true });
      this.logger.log(`Boas-vindas enviado para lead #${lead.id} (${lead.email})`);
    } catch (err: unknown) {
      await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, nome: lead.nome, tipo: 'lead_boas_vindas', destinatario: lead.email, enviado: false, erro: errMsg(err) });
      this.logger.warn(`Erro ao enviar boas-vindas para lead #${lead.id}: ${errMsg(err)}`);
    }
  }

  @Cron('0 9 * * *', { timeZone: 'America/Sao_Paulo' })
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
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, nome: lead.nome, tipo: 'lead_followup', destinatario: lead.email!, enviado: true });
        this.logger.log(`Follow-up enviado para lead #${lead.id}`);
      } catch (err: unknown) {
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, nome: lead.nome, tipo: 'lead_followup', destinatario: lead.email!, enviado: false, erro: errMsg(err) });
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
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, nome: lead.nome, tipo: 'lead_cta', destinatario: lead.email!, enviado: true });
        this.logger.log(`CTA enviado para lead #${lead.id}`);
      } catch (err: unknown) {
        await this.logRepo.save({ codigoLancamento: '', leadId: lead.id, nome: lead.nome, tipo: 'lead_cta', destinatario: lead.email!, enviado: false, erro: errMsg(err) });
      }
    }
  }

  // Busca a URL da página do curso (ipessp.edu.br/site/cursos/...) pelo código
  // Sophia do curso de interesse — null se não tiver código, tabela sem essa
  // linha, ou coluna ainda vazia (curso sem página mapeada).
  private async buscarUrlCurso(codigoCurso: number | null): Promise<string | null> {
    if (!codigoCurso) return null;
    const sb = this.supabase.getClient();
    if (!sb) return null;

    const { data, error } = await sb
      .from('curso_conteudo')
      .select('url_pagina')
      .eq('codigo_curso', codigoCurso)
      .maybeSingle();

    if (error) {
      this.logger.warn(`Erro ao buscar url_pagina do curso #${codigoCurso}: ${error.message}`);
      return null;
    }
    return data?.url_pagina ?? null;
  }

  // ─── Templates ───────────────────────────────────────────────────────────────
  // Reusam o mesmo cabeçalho/rodapé/cor institucional dos templates financeiros
  // (`baseConteudoLivre` em email.templates.ts) em vez de manter um layout
  // próprio — mesma identidade visual em todo email enviado pela escola.

  /** Mesmos campos lidos por EmailJobService.dadosEscola(), sem os links financeiros. */
  private dadosMarca(): MarcaEmailData {
    return {
      nomeEscola:     this.config.get<string>('email.nomeEscola') ?? 'Escola',
      emailEscola:    this.config.get<string>('email.from') || undefined,
      telefoneEscola: this.config.get<string>('email.telefoneEscola') || undefined,
      logoUrl:        this.config.get<string>('email.logoUrl') || undefined,
      siteUrl:        this.config.get<string>('email.siteUrl') || undefined,
      assetsBaseUrl:  this.config.get<string>('email.assetsBaseUrl') || undefined,
      instagramUrl:   this.config.get<string>('email.instagramUrl') || undefined,
      facebookUrl:    this.config.get<string>('email.facebookUrl') || undefined,
      youtubeUrl:     this.config.get<string>('email.youtubeUrl') || undefined,
      linkedinUrl:    this.config.get<string>('email.linkedinUrl') || undefined,
      cnpj:           this.config.get<string>('email.cnpj') || undefined,
      endereco:       this.config.get<string>('email.endereco') || undefined,
    };
  }

  private templateBoasVindas(nome: string, curso?: string, urlCurso?: string | null): string {
    const marca = this.dadosMarca();
    const cursoTexto = curso ? ` no curso <strong>${curso}</strong>` : '';
    const corpo = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:bold;color:#222222;font-family:Arial,sans-serif;">Recebemos seu interesse no IPESSP.</p>
    <p style="margin:0 0 18px;font-size:17px;font-weight:bold;color:#7C2529;text-transform:uppercase;font-family:Arial,sans-serif;">${nome},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">Ficamos muito felizes com seu interesse${cursoTexto} no IPESSP. Nossa equipe já foi notificada e entrará em contato em breve. Enquanto isso, que tal conhecer mais sobre nossos cursos e estrutura?</p>
    ${botaoCta(urlCurso ? 'Ver detalhes do curso' : 'Ver nossos cursos', urlCurso ?? marca.siteUrl ?? SITE_URL_FALLBACK)}`;
    return baseConteudoLivre('Bem-vindo(a) ao IPESSP', marca, corpo, `Ficamos felizes com seu interesse${cursoTexto ? ' no curso escolhido' : ''}. Nossa equipe já foi notificada.`);
  }

  private templateFollowUp(nome: string, curso?: string): string {
    const marca = this.dadosMarca();
    const cursoTexto = curso ? `sobre o curso <strong>${curso}</strong>` : 'sobre nossos cursos';
    const corpo = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:bold;color:#222222;font-family:Arial,sans-serif;">Ainda com dúvidas?</p>
    <p style="margin:0 0 18px;font-size:17px;font-weight:bold;color:#7C2529;text-transform:uppercase;font-family:Arial,sans-serif;">${nome},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">Notamos que você demonstrou interesse ${cursoTexto}. Nossa equipe está pronta para responder todas as suas perguntas sobre processo seletivo, valores e estrutura. Fale conosco pelo WhatsApp — é rápido e sem compromisso!</p>
    ${botaoCta('Falar pelo WhatsApp', WHATSAPP_EQUIPE_URL, COR_WHATSAPP)}`;
    return baseConteudoLivre('Ainda pensando? Podemos ajudar', marca, corpo, `Nossa equipe está pronta pra responder suas perguntas ${cursoTexto.replace(/<\/?strong>/g, '')}.`);
  }

  private templateCta(nome: string, curso?: string): string {
    const marca = this.dadosMarca();
    const cursoTexto = curso ? ` para o curso de ${curso}` : '';
    const corpo = `
    <p style="margin:0 0 6px;font-size:16px;font-weight:bold;color:#222222;font-family:Arial,sans-serif;">As inscrições estão abertas!</p>
    <p style="margin:0 0 18px;font-size:17px;font-weight:bold;color:#7C2529;text-transform:uppercase;font-family:Arial,sans-serif;">${nome},</p>
    <p style="margin:0 0 24px;font-size:14px;color:#444;line-height:1.7;font-family:Arial,sans-serif;">As vagas${cursoTexto} estão preenchendo rapidamente. Garanta a sua agora e dê o próximo passo na sua carreira com o suporte de um dos melhores institutos de São Paulo.</p>
    ${botaoCta('Fazer minha inscrição agora', `${marca.siteUrl ?? SITE_URL_FALLBACK}/inscricao`)}
    <p style="margin:12px 0 0;font-size:12px;color:#999;line-height:1.7;font-family:Arial,sans-serif;">Dúvidas? Responda este e-mail ou fale conosco no WhatsApp.</p>`;
    return baseConteudoLivre('Última chamada: inscrições abertas', marca, corpo, `As vagas${cursoTexto} estão preenchendo rapidamente. Garanta a sua agora.`);
  }
}
