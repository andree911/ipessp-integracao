import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { Lead } from './entities/lead.entity';
import { SophiaService } from '../sophia/sophia.service';
import { CriarLeadDto } from './dto/criar-lead.dto';
import { AtualizarLeadDto } from './dto/atualizar-lead.dto';

@Injectable()
export class LeadsService {
  private readonly logger = new Logger(LeadsService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
    private readonly sophia: SophiaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async criar(dto: CriarLeadDto): Promise<Lead> {
    const lead = this.leadRepo.create({
      nome: dto.nome,
      email: dto.email,
      telefone: dto.telefone,
      cursoInteresse: dto.cursoInteresse,
      origem: (dto.origem as Lead['origem']) ?? 'site',
      observacao: dto.observacao,
    });

    // Tenta criar no SophiA como prospecto
    try {
      const resultado = await this.sophia.criarCliente({
        nome: dto.nome,
        email: dto.email,
        telefone: dto.telefone,
        interesse: dto.cursoInteresse,
        observacao: dto.observacao,
      });
      lead.sophiaCodigo = String((resultado as any)?.codigo ?? (resultado as any)?.id ?? '');
      this.logger.log(`Lead "${dto.nome}" criado no SophiA (${lead.sophiaCodigo})`);
    } catch (err: any) {
      lead.sophiaErro = err.message;
      this.logger.warn(`Lead "${dto.nome}" salvo localmente — erro no SophiA: ${err.message}`);
    }

    const salvo = await this.leadRepo.save(lead);

    // Dispara webhook no n8n de forma assíncrona (não bloqueia a resposta)
    void this.dispararWebhook(salvo);

    return salvo;
  }

  async listar(filtros: {
    status?: string;
    origem?: string;
    de?: string;
    ate?: string;
  }): Promise<Lead[]> {
    const where: FindOptionsWhere<Lead> = {};
    if (filtros.status) where.status = filtros.status as Lead['status'];
    if (filtros.origem) where.origem = filtros.origem as Lead['origem'];
    if (filtros.de && filtros.ate) {
      where.criadoEm = Between(new Date(filtros.de), new Date(filtros.ate + 'T23:59:59'));
    }
    return this.leadRepo.find({ where, order: { criadoEm: 'DESC' } });
  }

  async atualizar(id: number, dto: AtualizarLeadDto): Promise<Lead> {
    const lead = await this.leadRepo.findOneBy({ id });
    if (!lead) throw new NotFoundException(`Lead #${id} não encontrado`);
    if (dto.status) lead.status = dto.status as Lead['status'];
    if (dto.observacao !== undefined) lead.observacao = dto.observacao;
    return this.leadRepo.save(lead);
  }

  async relatorio(): Promise<object> {
    const total = await this.leadRepo.count();
    const porStatus = await this.leadRepo
      .createQueryBuilder('l')
      .select('l.status', 'status')
      .addSelect('COUNT(*)', 'total')
      .groupBy('l.status')
      .getRawMany();

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

    const sincronizadosSophia = await this.leadRepo
      .createQueryBuilder('l')
      .where('l.sophiaCodigo IS NOT NULL AND l.sophiaCodigo != ""')
      .getCount();

    return { total, noMes, sincronizadosSophia, porStatus, porOrigem };
  }

  private async dispararWebhook(lead: Lead): Promise<void> {
    const url = this.config.get<string>('n8n.leadsWebhookUrl');
    if (!url) return;
    try {
      await firstValueFrom(this.http.post(url, lead));
      this.logger.log(`Webhook n8n disparado para lead #${lead.id}`);
    } catch (err: any) {
      this.logger.warn(`Falha no webhook n8n para lead #${lead.id}: ${err.message}`);
    }
  }
}
