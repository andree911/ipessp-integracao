import { Body, Controller, Get, NotFoundException, Param, Patch, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { Usuario } from '../auth/entities/usuario.entity';
import { Professor } from '../auth/entities/professor.entity';
import { Lead } from '../leads/entities/lead.entity';
import { LeadHistorico } from '../leads/entities/lead-historico.entity';
import { LeadsService } from '../leads/leads.service';

@Controller('v1/admin')
@UseGuards(AdminApiKeyGuard)
export class AdminController {
  constructor(
    @InjectRepository(Usuario) private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Professor) private readonly professorRepo: Repository<Professor>,
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    @InjectRepository(LeadHistorico) private readonly historicoRepo: Repository<LeadHistorico>,
    private readonly leadsService: LeadsService,
  ) {}

  // ─── Professores ─────────────────────────────────────────────────────────────

  @Get('professores')
  async listar() {
    const professores = await this.professorRepo.find();
    const usuarios = await this.usuarioRepo.find({ where: { tipo: 'professor' } });

    return usuarios
      .sort((a, b) => Number(a.ativo) - Number(b.ativo) || b.criadoEm.getTime() - a.criadoEm.getTime())
      .map(u => {
        const p = professores.find(pr => pr.usuarioId === u.id);
        return {
          id: u.id,
          nome: u.nome,
          email: u.email,
          ativo: u.ativo,
          criado_em: u.criadoEm,
          matricula: p?.matricula ?? null,
          telefone: p?.telefone ?? null,
          validado: p?.validado ?? false,
        };
      });
  }

  @Patch('professores/:id/aprovar')
  async aprovar(@Param('id') id: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id, tipo: 'professor' } });
    if (!usuario) throw new NotFoundException('professor não encontrado');

    await this.usuarioRepo.update(id, { ativo: true });
    await this.professorRepo.update({ usuarioId: id }, { validado: true });

    return { ok: true, professor: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
  }

  @Patch('professores/:id/rejeitar')
  async rejeitar(@Param('id') id: string) {
    const usuario = await this.usuarioRepo.findOne({ where: { id, tipo: 'professor' } });
    if (!usuario) throw new NotFoundException('professor não encontrado');

    await this.usuarioRepo.update(id, { ativo: false });

    return { ok: true, professor: { id: usuario.id, nome: usuario.nome, email: usuario.email } };
  }

  // ─── Leads / CRM ─────────────────────────────────────────────────────────────

  @Get('leads')
  listarLeads(
    @Query('status') status?: string,
    @Query('origem') origem?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
  ) {
    return this.leadsService.listar({ status, origem, de, ate });
  }

  @Get('leads/funil')
  funil() {
    return this.leadsService.relatorio();
  }

  @Get('leads/:id')
  buscarLead(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.buscarPorId(id);
  }

  @Get('leads/:id/historico')
  historicoLead(@Param('id', ParseIntPipe) id: number) {
    return this.leadsService.getHistorico(id);
  }

  @Patch('leads/:id/estagio')
  moverEstagioLead(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estagio: string; observacao?: string },
  ) {
    return this.leadsService.moverEstagio(id, body as any);
  }
}
