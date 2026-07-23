import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository, LessThanOrEqual, IsNull } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { WhatsAppService } from './whatsapp.service';
import { Lead } from '../leads/entities/lead.entity';
import { LeadHistorico } from '../leads/entities/lead-historico.entity';

// Mesmas 3 mensagens do fluxo n8n CRM-IPESSP-Leads-completo.json (nó "Montar
// Mensagens Nurturing", hoje só apontando pro ipessp-core) — trazidas pro
// backend em vez de depender de um flow no n8n pra rodar. Equivalente ao
// LeadWhatsAppService do core, mas sobre o Lead deste backend.
const MENSAGENS_NURTURING: ((nome: string, curso?: string) => string)[] = [
  (nome, curso) =>
    `Olá, ${nome}! 👋\n\nFicamos felizes com seu interesse no IPESSP${curso ? ` — especialmente no curso de *${curso}*` : ''}!\n\nSou a assistente virtual e estou aqui para tirar suas dúvidas sobre nossos cursos. Pode me perguntar qualquer coisa! 📚\n\nSe preferir, nossa equipe também está disponível para um atendimento personalizado.`,
  (nome) =>
    `${nome}, vi que você ainda está conhecendo o IPESSP! 🎓\n\nPosso te ajudar com:\n📚 Cursos disponíveis\n💰 Formas de pagamento\n📅 Próximas turmas\n\nResponda aqui ou fale com nossa equipe!`,
  (nome) =>
    `⏰ ${nome}, as vagas estão preenchendo!\n\n✅ Processo seletivo simples\n✅ Parcelamento facilitado\n✅ Certificado reconhecido\n\nGaranta sua vaga: https://ipessp.edu.br/inscricao`,
];

@Injectable()
export class LeadWhatsAppService {
  private readonly logger = new Logger(LeadWhatsAppService.name);

  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(LeadHistorico) private readonly historicoRepo: Repository<LeadHistorico>,
    private readonly whatsapp: WhatsAppService,
    private readonly config: ConfigService,
  ) {}

  private get habilitado(): boolean {
    return this.config.get<string>('zapi.leadNurturingCronHabilitado') === 'true';
  }

  @Cron('*/30 * * * *', { timeZone: 'America/Sao_Paulo' })
  async processarNurturing(): Promise<void> {
    if (!this.habilitado) return;

    const agora = new Date();
    const leads = await this.leadRepo.find({
      where: [
        { nurturingPausado: false, status: 'novo',      whatsappOptin: true, proximoContato: LessThanOrEqual(agora) },
        { nurturingPausado: false, status: 'contatado', whatsappOptin: true, proximoContato: LessThanOrEqual(agora) },
        { nurturingPausado: false, status: 'novo',      whatsappOptin: true, proximoContato: IsNull() },
        { nurturingPausado: false, status: 'contatado', whatsappOptin: true, proximoContato: IsNull() },
      ],
      order: { criadoEm: 'ASC' },
    });

    for (const lead of leads) {
      if (!lead.telefone) continue;
      if (lead.etapaNurturing >= MENSAGENS_NURTURING.length) continue;

      const mensagem = MENSAGENS_NURTURING[lead.etapaNurturing](lead.nome, lead.cursoInteresse);
      try {
        await this.whatsapp.enviarTexto(lead.telefone, mensagem);
        await this.avancarEtapa(lead);
      } catch (err) {
        this.logger.warn(`Falha ao enviar WhatsApp de nurturing pro lead #${lead.id}: ${(err as Error).message}`);
      }
    }
  }

  private async avancarEtapa(lead: Lead): Promise<void> {
    const novaEtapa = lead.etapaNurturing + 1;
    const pausado = novaEtapa >= MENSAGENS_NURTURING.length;
    const proximo = pausado ? null : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    await this.leadRepo.update(lead.id, {
      etapaNurturing: novaEtapa,
      nurturingPausado: pausado,
      proximoContato: proximo,
    });

    await this.historicoRepo.save(this.historicoRepo.create({
      leadId: lead.id,
      estagioAnterior: lead.status,
      estagioNovo: lead.status,
      observacao: `WhatsApp de nurturing — etapa ${novaEtapa} enviada`,
    }));
  }

  @Cron('0 9 * * *', { timeZone: 'America/Sao_Paulo' })
  async reativarPausados(): Promise<void> {
    if (!this.habilitado) return;

    const agora = new Date();
    const leads = await this.leadRepo.find({
      where: { nurturingPausado: true, proximoContato: LessThanOrEqual(agora) },
    });
    for (const lead of leads) {
      await this.leadRepo.update(lead.id, { nurturingPausado: false });
    }
  }
}
