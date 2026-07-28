import { BadRequestException, Injectable, Logger, NotFoundException, Optional } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, Between, LessThanOrEqual, MoreThan, Not, IsNull, In } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { errMsg } from '../common/err.util';
import { firstValueFrom } from 'rxjs';
import { Lead } from './entities/lead.entity';
import { LeadHistorico } from './entities/lead-historico.entity';
import { LeadDistribuicaoConsultoras } from './entities/lead-distribuicao.entity';
import { EmailLog } from '../email/entities/email-log.entity';
import { CriarLeadDto } from './dto/criar-lead.dto';
import { AtualizarLeadDto } from './dto/atualizar-lead.dto';
import { MoverEstagioDto } from './dto/mover-estagio.dto';
import { ReatribuirLeadDto } from './dto/reatribuir-lead.dto';
import { LeadEmailService } from '../email/lead-email.service';
import { WhatsAppService } from '../email/whatsapp.service';

const TIPOS_EMAIL_LEAD = ['lead_boas_vindas', 'lead_followup', 'lead_cta'];

// Tempo de espera em ms para cada etapa de nurturing
const ETAPAS_NURTURING = [
  5 * 60 * 1000,           // etapa 0 → boas-vindas após 5 min
  24 * 60 * 60 * 1000,     // etapa 1 → follow-up após 1 dia
  2 * 24 * 60 * 60 * 1000, // etapa 2 → CTA após 2 dias
];

const STATUS_ATIVOS: Lead['status'][] = ['novo', 'contatado'];

// Tempo sem sair do status "novo" pra considerar que a consultora atual não
// conseguiu atender e reatribuir automaticamente pra outra
const TIMEOUT_ATRIBUICAO_MS = 20 * 60 * 1000;

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    @InjectRepository(LeadHistorico)
    private readonly historicoRepo: Repository<LeadHistorico>,
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Optional() private readonly leadEmail?: LeadEmailService,
    @Optional() private readonly whatsapp?: WhatsAppService,
  ) {}

  async criar(dto: CriarLeadDto): Promise<Lead> {
    // Origem 'chatbot' é sempre a IA — telefone já vem automático do webhook,
    // então o risco real é ela pular email/cursoInteresse e a consultora
    // receber um lead sem contato útil ou sem saber o que oferecer.
    if (dto.origem === 'chatbot' && (!dto.email || !dto.cursoInteresse)) {
      throw new BadRequestException('Lead via chatbot precisa de email e cursoInteresse preenchidos');
    }

    if (dto.telefone) {
      const existente = await this.leadRepo.findOne({
        where: { telefone: dto.telefone, status: Not(In(['perdido', 'matriculado'])) },
        order: { criadoEm: 'DESC' },
      });
      if (existente) return this.atualizarInteresseExistente(existente, dto);
    }

    const lead = this.leadRepo.create({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      cursoInteresse: dto.cursoInteresse,
      codigoCurso: dto.codigoCurso ?? null,
      whatsappOptin: dto.whatsappOptin ?? false,
      origem: (dto.origem as Lead['origem']) ?? 'site',
      observacao: dto.observacao,
      etapaNurturing: 0,
      nurturingPausado: false,
      proximoContato: dto.telefone ? new Date(Date.now() + ETAPAS_NURTURING[0]) : null,
    });

    const salvo = await this.leadRepo.save(lead);

    void this.dispararWebhook(salvo);
    if (this.leadEmail) void this.leadEmail.enviarBoasVindas(salvo);
    void this.notificarConsultoras(salvo);

    return salvo;
  }

  // Avisa UMA consultora de marketing por WhatsApp assim que a IA registra um lead novo,
  // em rodízio (nunca a mesma duas vezes seguidas) — e grava a atribuição no lead, que a
  // aba de leads do corporativo enxerga (tabela `lead` é compartilhada).
  private async notificarConsultoras(lead: Lead): Promise<void> {
    if (!this.whatsapp) return;
    const numeros = this.config.get<string[]>('zapi.telefonesConsultorasMarketing') ?? [];
    if (numeros.length === 0) return;

    const numeroEscolhido = await this.proximaConsultora(numeros);
    // Grava a atribuição ANTES de tentar enviar: se o WhatsApp falhar (Z-API fora,
    // número inválido etc.), o lead continua com consultoraResponsavel preenchido e
    // atribuidoEm recente — assim o timeout automático consegue reatribuir pra outra
    // consultora depois, em vez de o lead ficar órfão (sem ninguém, sem retry).
    await this.leadRepo.update(lead.id, { consultoraResponsavel: numeroEscolhido, atribuidoEm: new Date() });

    try {
      await this.whatsapp.enviarTexto(numeroEscolhido, this.montarMensagemLead(lead));
    } catch (err: unknown) {
      this.logger.warn(`Falha ao notificar consultora ${numeroEscolhido} do lead #${lead.id}: ${errMsg(err)}`);
    }
  }

  private montarMensagemLead(lead: Lead, prefixo = '🔔 *Novo lead registrado pela IA*'): string {
    const linhas = [
      prefixo,
      `*Nome:* ${lead.nome}`,
      lead.telefone && `*Telefone:* ${lead.telefone}`,
      lead.email && `*E-mail:* ${lead.email}`,
      lead.cursoInteresse && `*Curso de interesse:* ${lead.cursoInteresse}`,
      `*Origem:* ${lead.origem}`,
      lead.observacao && `*Observação:* ${lead.observacao}`,
    ].filter(Boolean);
    return linhas.join('\n');
  }

  // Escolhe o próximo número da lista em rodízio, sem repetir. O estado (próximo
  // índice) fica numa linha única travada com pessimistic_write, então dois leads
  // criados ao mesmo tempo são serializados e não caem na mesma consultora.
  private async proximaConsultora(numeros: string[]): Promise<string> {
    return this.dataSource.transaction(async (em) => {
      const repo = em.getRepository(LeadDistribuicaoConsultoras);
      let estado = await repo
        .createQueryBuilder('e')
        .setLock('pessimistic_write')
        .where('e.id = :id', { id: 1 })
        .getOne();

      if (!estado) {
        estado = await repo.save(repo.create({ id: 1, proximoIndice: 0 }));
      }

      const indice = estado.proximoIndice % numeros.length;
      estado.proximoIndice = (indice + 1) % numeros.length;
      await repo.save(estado);

      return numeros[indice];
    });
  }

  // Reatribuição manual (ex: consultora avisa que não vai dar conta) — pega a
  // próxima da lista após a atual, sem mexer no índice do rodízio (que serve só
  // pra distribuir os PRÓXIMOS leads novos, não pra corrigir um já atribuído).
  async reatribuir(id: number, observacao?: string): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
    return this.executarReatribuicao(lead, observacao ? `Reatribuição manual — ${observacao}` : 'Reatribuição manual');
  }

  private async executarReatribuicao(lead: Lead, motivo: string): Promise<Lead> {
    const numeros = this.config.get<string[]>('zapi.telefonesConsultorasMarketing') ?? [];
    if (numeros.length < 2) {
      throw new BadRequestException('É preciso ao menos 2 números em ZAPI_TELEFONES_CONSULTORAS_MARKETING para reatribuir');
    }

    const indiceAtual = lead.consultoraResponsavel ? numeros.indexOf(lead.consultoraResponsavel) : -1;
    const numeroNovo = numeros[(indiceAtual + 1) % numeros.length];
    const numeroAnterior = lead.consultoraResponsavel;

    lead.consultoraResponsavel = numeroNovo;
    lead.atribuidoEm = new Date();
    await this.leadRepo.save(lead);

    await this.historicoRepo.save({
      leadId: lead.id,
      estagioAnterior: lead.status,
      estagioNovo: lead.status,
      observacao: `${motivo}: ${numeroAnterior ?? 'ninguém'} → ${numeroNovo}`,
    });

    if (this.whatsapp) {
      try {
        await this.whatsapp.enviarTexto(numeroNovo, this.montarMensagemLead(lead, '🔄 *Lead reatribuído pra você*'));
      } catch (err: unknown) {
        this.logger.warn(`Falha ao notificar consultora ${numeroNovo} sobre reatribuição do lead #${lead.id}: ${errMsg(err)}`);
      }
    }

    return lead;
  }

  // Rede de segurança: lead que ficou parado em "novo" (ninguém avançou o funil)
  // por mais de TIMEOUT_ATRIBUICAO_MS desde a última atribuição é passado
  // automaticamente pra outra consultora.
  @Cron('*/5 * * * *')
  async reatribuirLeadsSemAtendimento(): Promise<void> {
    const numeros = this.config.get<string[]>('zapi.telefonesConsultorasMarketing') ?? [];
    if (numeros.length < 2) return;

    const limite = new Date(Date.now() - TIMEOUT_ATRIBUICAO_MS);
    const leads = await this.leadRepo.find({
      where: {
        status: 'novo',
        consultoraResponsavel: Not(IsNull()),
        atribuidoEm: LessThanOrEqual(limite),
      },
    });

    for (const lead of leads) {
      try {
        await this.executarReatribuicao(lead, 'Sem atendimento em 20 min — reatribuição automática');
        this.logger.log(`Lead #${lead.id} reatribuído automaticamente por timeout`);
      } catch (err: unknown) {
        this.logger.warn(`Falha ao reatribuir lead #${lead.id} por timeout: ${errMsg(err)}`);
      }
    }
  }

  // Telefone já tem um lead ativo (não perdido/matriculado): atualiza em vez de duplicar
  private async atualizarInteresseExistente(lead: Lead, dto: CriarLeadDto): Promise<Lead> {
    if (dto.nome) lead.nome = dto.nome;
    if (dto.email) lead.email = dto.email;
    if (dto.cursoInteresse) lead.cursoInteresse = dto.cursoInteresse;
    if (dto.codigoCurso !== undefined) lead.codigoCurso = dto.codigoCurso;
    if (dto.observacao) lead.observacao = dto.observacao;
    // Explícito (true ou false) — reflete a escolha do checkbox no reenvio, não só concede
    if (dto.whatsappOptin !== undefined) lead.whatsappOptin = dto.whatsappOptin;

    if (STATUS_ATIVOS.includes(lead.status)) {
      lead.etapaNurturing = 0;
      lead.nurturingPausado = false;
      lead.proximoContato = new Date(Date.now() + ETAPAS_NURTURING[0]);
    }

    await this.historicoRepo.save({
      leadId: lead.id,
      estagioAnterior: lead.status,
      estagioNovo: lead.status,
      observacao: `Novo interesse registrado (origem: ${dto.origem ?? 'site'}) — nurturing reativado`,
    });

    return this.leadRepo.save(lead);
  }

  async listar(filtros: {
    status?: string;
    origem?: string;
    telefone?: string;
    de?: string;
    ate?: string;
    page?: number;
    limit?: number;
    emailEnviado?: boolean;
    whatsappEnviado?: boolean;
    respondeu?: boolean;
  }): Promise<{ data: Lead[]; total: number; page: number; pages: number }> {
    const page = Math.max(1, filtros.page ?? 1);
    const limit = Math.min(200, Math.max(1, filtros.limit ?? 50));

    const qb = this.leadRepo.createQueryBuilder('l');
    if (filtros.status) qb.andWhere('l.status = :status', { status: filtros.status });
    if (filtros.origem) qb.andWhere('l.origem = :origem', { origem: filtros.origem });
    if (filtros.telefone) qb.andWhere('l.telefone = :telefone', { telefone: filtros.telefone });
    if (filtros.de && filtros.ate) {
      qb.andWhere('l.criadoEm BETWEEN :de AND :ate', {
        de: new Date(filtros.de),
        ate: new Date(filtros.ate + 'T23:59:59'),
      });
    }
    if (filtros.whatsappEnviado !== undefined) {
      qb.andWhere(filtros.whatsappEnviado ? 'l.etapaNurturing > 0' : 'l.etapaNurturing = 0');
    }
    if (filtros.respondeu !== undefined) {
      qb.andWhere(filtros.respondeu ? 'l.ultimaInteracaoBot IS NOT NULL' : 'l.ultimaInteracaoBot IS NULL');
    }
    if (filtros.emailEnviado !== undefined) {
      const sub = qb.subQuery()
        .select('1')
        .from(EmailLog, 'el')
        .where('el.leadId = l.id')
        .andWhere('el.enviado = true')
        .andWhere('el.tipo IN (:...tiposEmailLead)')
        .getQuery();
      qb.andWhere(`${filtros.emailEnviado ? 'EXISTS' : 'NOT EXISTS'} ${sub}`, { tiposEmailLead: TIPOS_EMAIL_LEAD });
    }

    qb.orderBy('l.criadoEm', 'DESC').take(limit).skip((page - 1) * limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async buscarPorId(id: number): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
    return lead;
  }

  async buscarPorTelefone(telefone: string): Promise<Lead | null> {
    return this.leadRepo.findOne({
      where: { telefone },
      order: { criadoEm: 'DESC' },
    });
  }

  async atualizar(id: number, dto: AtualizarLeadDto): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
    if (dto.status) lead.status = dto.status as Lead['status'];
    if (dto.observacao !== undefined) lead.observacao = dto.observacao;
    return this.leadRepo.save(lead);
  }

  async vincularAluno(id: number, codigoAluno: number): Promise<Lead> {
    return this.dataSource.transaction(async (em) => {
      const lead = await em.findOneBy(Lead, { id });
      if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
      const anterior = lead.status;
      lead.sophiaAlunoId = codigoAluno;
      lead.status = 'matriculado';
      lead.nurturingPausado = true;
      lead.proximoContato = null;
      await em.save(LeadHistorico, {
        leadId: id,
        estagioAnterior: anterior,
        estagioNovo: 'matriculado',
        observacao: `Vinculado ao aluno SophiA #${codigoAluno}`,
      });
      return em.save(Lead, lead);
    });
  }

  async moverEstagio(id: number, dto: MoverEstagioDto): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
    const anterior = lead.status;
    lead.status = dto.estagio as Lead['status'];
    if (!STATUS_ATIVOS.includes(lead.status)) {
      lead.nurturingPausado = true;
      lead.proximoContato = null;
    }
    await this.historicoRepo.save({
      leadId: id,
      estagioAnterior: anterior,
      estagioNovo: dto.estagio,
      observacao: dto.observacao ?? null,
    });
    return this.leadRepo.save(lead);
  }

  async getHistorico(id: number): Promise<LeadHistorico[]> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
    return this.historicoRepo.find({ where: { leadId: id }, order: { criadoEm: 'ASC' } });
  }

  // Retorna leads aguardando o próximo toque de nurturing
  async listarProntosParaContato(): Promise<Lead[]> {
    return this.leadRepo.find({
      where: {
        nurturingPausado: false,
        status: In(STATUS_ATIVOS),
        proximoContato: LessThanOrEqual(new Date()),
      },
      order: { proximoContato: 'ASC' },
    });
  }

  // Avança a etapa do nurturing e agenda o próximo contato
  async avancarNurturing(id: number): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);

    lead.etapaNurturing += 1;

    const proximaEspera = ETAPAS_NURTURING[lead.etapaNurturing];
    lead.proximoContato = proximaEspera ? new Date(Date.now() + proximaEspera) : null;

    if (lead.status === 'novo') {
      const anterior = lead.status;
      lead.status = 'contatado';
      await this.historicoRepo.save({
        leadId: id,
        estagioAnterior: anterior,
        estagioNovo: 'contatado',
        observacao: `Contato automático — etapa ${lead.etapaNurturing}`,
      });
    }

    return this.leadRepo.save(lead);
  }

  // Registra interação do bot: pausa nurturing por 48h e atualiza status
  async registrarInteracaoBot(telefone: string): Promise<{ encontrado: boolean; leadId?: number }> {
    const lead = await this.buscarPorTelefone(telefone);
    if (!lead) return { encontrado: false };

    lead.ultimaInteracaoBot = new Date();
    lead.nurturingPausado = true;

    // Retoma nurturing após 48h a partir da última interação
    lead.proximoContato = new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (lead.status === 'novo') {
      await this.historicoRepo.save({
        leadId: lead.id,
        estagioAnterior: 'novo',
        estagioNovo: 'contatado',
        observacao: 'Interação via chatbot',
      });
      lead.status = 'contatado';
    }

    await this.leadRepo.save(lead);
    return { encontrado: true, leadId: lead.id };
  }

  // Reativa nurturing de leads que ficaram em pausa e passaram 48h sem interagir
  async reativarNurturingPausado(): Promise<number> {
    const limite = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const leads = await this.leadRepo.find({
      where: {
        nurturingPausado: true,
        status: In(STATUS_ATIVOS),
        ultimaInteracaoBot: LessThanOrEqual(limite),
      },
    });

    for (const lead of leads) {
      if (lead.etapaNurturing < ETAPAS_NURTURING.length) {
        lead.nurturingPausado = false;
        lead.proximoContato = new Date(Date.now() + ETAPAS_NURTURING[lead.etapaNurturing]);
        await this.leadRepo.save(lead);
      }
    }

    return leads.length;
  }

  async relatorio(): Promise<object> {
    const total = await this.leadRepo.count();

    const porOrigem = await this.leadRepo
      .createQueryBuilder('l')
      .select('l.origem', 'origem')
      .addSelect('COUNT(*)', 'total')
      .groupBy('l.origem')
      .getRawMany();

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const noMes = await this.leadRepo.count({
      where: { criadoEm: Between(inicioMes, hoje) },
    });

    const estagios = ['novo', 'contatado', 'agendado', 'inscrito', 'matriculado', 'perdido'];
    const contagemPorEstagio = await this.leadRepo
      .createQueryBuilder('l')
      .select('l.status', 'estagio')
      .addSelect('COUNT(*)', 'total')
      .groupBy('l.status')
      .getRawMany();

    const funil = estagios.map(e => ({
      estagio: e,
      total: Number(contagemPorEstagio.find(r => r.estagio === e)?.total ?? 0),
    }));

    const totalAtivos = funil
      .filter(f => f.estagio !== 'perdido')
      .reduce((s, f) => s + f.total, 0);

    const taxaConversao = totalAtivos > 0
      ? ((funil.find(f => f.estagio === 'matriculado')?.total ?? 0) / totalAtivos * 100).toFixed(1) + '%'
      : '0%';

    const emNurturing = await this.leadRepo.count({
      where: { nurturingPausado: false, status: In(STATUS_ATIVOS) },
    });

    const comWhatsappEnviado = await this.leadRepo.count({ where: { etapaNurturing: MoreThan(0) } });
    const comResposta = await this.leadRepo.count({ where: { ultimaInteracaoBot: Not(IsNull()) } });
    const nurturingEsgotado = await this.leadRepo.count({
      where: {
        status: In(STATUS_ATIVOS),
        etapaNurturing: MoreThan(ETAPAS_NURTURING.length - 1),
        ultimaInteracaoBot: IsNull(),
      },
    });
    const comEmailEnviado = await this.leadRepo
      .createQueryBuilder('l')
      .where((qb) => {
        const sub = qb.subQuery()
          .select('1')
          .from(EmailLog, 'el')
          .where('el.leadId = l.id')
          .andWhere('el.enviado = true')
          .andWhere('el.tipo IN (:...tiposEmailLead)')
          .getQuery();
        return `EXISTS ${sub}`;
      })
      .setParameter('tiposEmailLead', TIPOS_EMAIL_LEAD)
      .getCount();

    const segmentos = {
      emailEnviado: comEmailEnviado,
      whatsappEnviado: comWhatsappEnviado,
      respondeu: comResposta,
      matriculado: funil.find(f => f.estagio === 'matriculado')?.total ?? 0,
      nurturingEsgotadoSemResposta: nurturingEsgotado,
    };

    return { total, noMes, porOrigem, funil, taxaConversao, emNurturing, segmentos };
  }

  async relatorioDiario(): Promise<object> {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());

    const novosHoje = await this.leadRepo.count({
      where: { criadoEm: Between(inicioHoje, hoje) },
    });

    const interacoesHoje = await this.leadRepo.count({
      where: { ultimaInteracaoBot: Between(inicioHoje, hoje) },
    });

    const convertidosHoje = await this.leadRepo.count({
      where: { status: 'matriculado', atualizadoEm: Between(inicioHoje, hoje) },
    });

    return { novosHoje, interacoesHoje, convertidosHoje, geradoEm: hoje };
  }

  private async dispararWebhook(lead: Lead): Promise<void> {
    const url = this.config.get<string>('n8n.leadsWebhookUrl');
    if (!url) return;
    const MAX_TENTATIVAS = 3;
    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      try {
        await firstValueFrom(this.http.post(url, lead));
        this.logger.log(`Webhook n8n disparado para lead #${lead.id}`);
        return;
      } catch (err: unknown) {
        if (tentativa === MAX_TENTATIVAS) {
          this.logger.warn(`Falha no webhook n8n para lead #${lead.id} após ${MAX_TENTATIVAS} tentativas: ${errMsg(err)}`);
        } else {
          await new Promise((r) => setTimeout(r, tentativa * 1000));
        }
      }
    }
  }
}
