import { Body, Controller, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { Lead } from '../leads/entities/lead.entity';
import { LeadsService } from '../leads/leads.service';
import { MoverEstagioDto } from '../leads/dto/mover-estagio.dto';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { EmailJobService } from '../email/email-job.service';
import { SophiaService } from '../sophia/sophia.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Controller('v1/admin')
@UseGuards(ThrottlerGuard, AdminApiKeyGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class AdminController {
  constructor(
    @InjectRepository(Lead) private readonly leadRepo: Repository<Lead>,
    private readonly leadsService: LeadsService,
    private readonly financeiroService: FinanceiroService,
    private readonly emailJobService: EmailJobService,
    private readonly sophia: SophiaService,
  ) {}

  // ─── Leads / CRM ─────────────────────────────────────────────────────────────

  @Get('leads')
  listarLeads(
    @Query('status') status?: string,
    @Query('origem') origem?: string,
    @Query('de') de?: string,
    @Query('ate') ate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.leadsService.listar({
      status, origem, de, ate,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
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
    @Body() dto: MoverEstagioDto,
  ) {
    return this.leadsService.moverEstagio(id, dto);
  }

  // ─── Financeiro ──────────────────────────────────────────────────────────────

  @Get('financeiro/stats')
  statsFinanceiro() {
    return this.financeiroService.stats();
  }

  @Get('financeiro/buscar')
  buscarCliente(@Query('cpf') cpf: string) {
    if (!cpf) return { erro: 'Informe o parâmetro cpf' };
    return this.financeiroService.getByCpf(cpf);
  }

  // ─── Email Jobs ───────────────────────────────────────────────────────────────

  @Get('email/status')
  emailStatus() {
    return { habilitado: this.emailJobService.habilitado };
  }

  @Post('email/toggle')
  @HttpCode(200)
  emailToggle(@Body('ativo') ativo: boolean) {
    this.emailJobService.toggleHabilitado(ativo);
    return { ok: true, habilitado: ativo };
  }

  @Post('email/disparar')
  @HttpCode(202)
  emailDisparar() {
    void this.emailJobService.runEmailJob('manual');
    return { message: 'Job de emails iniciado manualmente' };
  }

  // ─── Diagnóstico Sophia ─────────────────────────────────────────────────────
  // Endpoints temporários pra inspecionar o formato real de retorno de
  // Notas/Horário (não documentado de forma confiável no swagger da Sophia).
  // Sem guard além do AdminApiKeyGuard da classe — não expõe token da Sophia.

  @Get('sophia/notas')
  diagnosticoNotas(@Query('matricula', ParseIntPipe) matricula: number) {
    return this.sophia.getNotasAvaliacoes(matricula);
  }

  @Get('sophia/horario')
  diagnosticoHorario(@Query('matricula', ParseIntPipe) matricula: number) {
    return this.sophia.getHorarioDetalhado(matricula);
  }
}
