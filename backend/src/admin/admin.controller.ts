import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { Lead } from '../leads/entities/lead.entity';
import { LeadsService } from '../leads/leads.service';
import { MoverEstagioDto } from '../leads/dto/mover-estagio.dto';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { EmailJobService } from '../email/email-job.service';
import { WhatsAppService } from '../email/whatsapp.service';
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
    private readonly whatsapp: WhatsAppService,
    private readonly sophia: SophiaService,
    private readonly config: ConfigService,
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
      status,
      origem,
      de,
      ate,
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

  @Get('email/historico')
  historicoEmail(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.emailJobService.listarHistoricoEmail(
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  // ─── Cancelamento de curso ──────────────────────────────────────────────────

  @Get('cancelamento/buscar-aluno')
  buscarAlunoCancelamento(@Query('q') q: string) {
    if (!q?.trim()) return [];
    return this.financeiroService.buscarAlunos(q);
  }

  @Get('cancelamento/financeiro')
  financeiroCancelamento(@Query('ra') ra: string) {
    if (!ra?.trim()) throw new BadRequestException('Informe o parâmetro ra');
    return this.financeiroService.getResumoCancelamento(ra);
  }

  @Post('cancelamento/email')
  @HttpCode(200)
  emailCancelamento(
    @Body('ra') ra: string,
    @Body('tipo') tipo: 'academico' | 'financeiro',
    @Body('dados') dados?: {
      numeroParcelasRestantes?: number;
      valorParcela?: number;
      somaValor?: number;
      valorMulta?: number;
      parcelasEmAtraso?: number;
      saldoDevedor?: number;
    },
  ) {
    if (!ra?.trim()) throw new BadRequestException('Informe o campo "ra"');
    if (tipo !== 'academico' && tipo !== 'financeiro') {
      throw new BadRequestException(
        'Campo "tipo" deve ser "academico" ou "financeiro"',
      );
    }
    return this.emailJobService.enviarCancelamento(ra, tipo, dados);
  }

  // ─── Diagnóstico Sophia ─────────────────────────────────────────────────────
  // Endpoints temporários pra inspecionar o formato real de retorno de
  // Notas/Horário (não documentado de forma confiável no swagger da Sophia).
  // Sem guard além do AdminApiKeyGuard da classe — não expõe token da Sophia.

  // Busca por nome na Sophia (endpoint /Alunos, filtro Nome) — devolve
  // "codigo" (o que sophia/matriculas espera) ao lado de "codigoExterno"
  // (o RA, que é o que costuma aparecer na tela de cadastro do aluno).
  @Get('sophia/buscar-por-nome')
  diagnosticoBuscarPorNome(@Query('nome') nome: string) {
    if (!nome?.trim())
      throw new BadRequestException('Informe o parâmetro nome');
    return this.sophia.getAlunos(1, 20, nome);
  }

  // codigoAluno = o "codigo" (não o "codigoExterno"/RA) do aluno na Sophia —
  // use sophia/buscar-por-nome se só tiver o RA. Devolve as matrículas dele —
  // usa o "codigoMatricula" do resultado nas duas rotas abaixo (sophia/notas
  // e sophia/horario), que pedem outro código.
  @Get('sophia/matriculas')
  diagnosticoMatriculas(@Query('aluno', ParseIntPipe) codigoAluno: number) {
    return this.sophia.getMatriculasAluno(codigoAluno);
  }

  @Get('sophia/notas')
  diagnosticoNotas(@Query('matricula', ParseIntPipe) matricula: number) {
    return this.sophia.getNotasAvaliacoes(matricula);
  }

  @Get('sophia/horario')
  diagnosticoHorario(@Query('matricula', ParseIntPipe) matricula: number) {
    return this.sophia.getHorarioDetalhado(matricula);
  }

  // ─── Diagnóstico WhatsApp ───────────────────────────────────────────────────
  // Só booleanos (presença/valor de flag) — nunca os valores das credenciais.
  @Get('whatsapp/status')
  diagnosticoWhatsappStatus() {
    return {
      wppCronHabilitado:
        this.config.get<string>('zapi.cronHabilitado') === 'true',
      zapiInstanceIdConfigurada: !!this.config.get<string>('zapi.instanceId'),
      zapiTokenConfigurada: !!this.config.get<string>('zapi.token'),
      zapiClientTokenConfigurada: !!this.config.get<string>('zapi.clientToken'),
      telefoneFinanceiroConfigurado: !!this.config.get<string>(
        'zapi.telefoneFinanceiro',
      ),
      diasAntes: this.config.get<number[]>('zapi.diasAntes'),
      diasApos: this.config.get<number[]>('zapi.diasApos'),
    };
  }

  /** Chama a Z-API de verdade pra saber se a sessão do WhatsApp está pareada — independe de qualquer envio. */
  @Get('whatsapp/conexao')
  diagnosticoWhatsappConexao() {
    return this.whatsapp.verificarConexao();
  }
}
