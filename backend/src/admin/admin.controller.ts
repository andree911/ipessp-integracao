import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  Logger,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { EmailJobService, HistoricoFiltro } from '../email/email-job.service';
import { WhatsAppService } from '../email/whatsapp.service';
import { SophiaService } from '../sophia/sophia.service';
import { errMsg } from '../common/err.util';

const HISTORICO_EMAIL_LIMIT_MAX = 200;

// Valida os filtros crus da querystring antes de repassar ao service —
// valor fora do enum esperado é ignorado (sem filtro) em vez de quebrar a
// query no banco.
function filtroHistorico(raw: {
  busca?: string;
  status?: string;
  categoria?: string;
  dataInicio?: string;
  dataFim?: string;
}): HistoricoFiltro {
  return {
    busca: raw.busca?.trim() || undefined,
    status: raw.status === 'enviado' || raw.status === 'erro' ? raw.status : undefined,
    categoria:
      raw.categoria === 'antes' || raw.categoria === 'no_dia' || raw.categoria === 'depois'
        ? raw.categoria
        : undefined,
    dataInicio: raw.dataInicio?.trim() || undefined,
    dataFim: raw.dataFim?.trim() || undefined,
  };
}

@Controller('v1/admin')
@UseGuards(ThrottlerGuard, AdminApiKeyGuard)
@Throttle({ default: { limit: 30, ttl: 60000 } })
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private readonly financeiroService: FinanceiroService,
    private readonly emailJobService: EmailJobService,
    private readonly whatsapp: WhatsAppService,
    private readonly sophia: SophiaService,
    private readonly config: ConfigService,
  ) {}

  // ─── Financeiro ──────────────────────────────────────────────────────────────

  @Get('financeiro/stats')
  statsFinanceiro() {
    return this.financeiroService.stats();
  }

  @Get('financeiro/buscar')
  buscarCliente(@Query('cpf') cpf: string) {
    if (!cpf) throw new BadRequestException('Informe o parâmetro cpf');
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
    this.emailJobService.runEmailJob('manual').catch((err: unknown) => {
      this.logger.error(
        `Job de emails (disparo manual via admin) falhou: ${errMsg(err)}`,
      );
    });
    return { message: 'Job de emails iniciado manualmente' };
  }

  @Get('email/historico')
  historicoEmail(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('busca') busca?: string,
    @Query('status') status?: string,
    @Query('categoria') categoria?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const limitLimitado = limit
      ? Math.min(limit, HISTORICO_EMAIL_LIMIT_MAX)
      : undefined;
    return this.emailJobService.listarHistoricoEmail(
      page,
      limitLimitado,
      filtroHistorico({ busca, status, categoria, dataInicio, dataFim }),
    );
  }

  @Get('whatsapp/historico')
  historicoWhatsApp(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('busca') busca?: string,
    @Query('status') status?: string,
    @Query('categoria') categoria?: string,
    @Query('dataInicio') dataInicio?: string,
    @Query('dataFim') dataFim?: string,
  ) {
    const limitLimitado = limit
      ? Math.min(limit, HISTORICO_EMAIL_LIMIT_MAX)
      : undefined;
    return this.emailJobService.listarHistoricoWhatsApp(
      page,
      limitLimitado,
      filtroHistorico({ busca, status, categoria, dataInicio, dataFim }),
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
    @Body('tipo') tipo: 'academico' | 'financeiro' | 'reembolso',
    @Body('dados')
    dados?: {
      numeroParcelasRestantes?: number;
      valorParcela?: number;
      somaValor?: number;
      valorMulta?: number;
      parcelasEmAtraso?: number;
      saldoDevedor?: number;
    },
  ) {
    if (!ra?.trim()) throw new BadRequestException('Informe o campo "ra"');
    if (tipo !== 'academico' && tipo !== 'financeiro' && tipo !== 'reembolso') {
      throw new BadRequestException(
        'Campo "tipo" deve ser "academico", "financeiro" ou "reembolso"',
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

  // Diagnóstico pontual (não é rota de uso recorrente): compara o total de
  // Alunos que a Sophia lista contra quem já está no clientes_cache, e pra
  // quem falta, confere ao vivo se tem lançamento pendente -- confirma se o
  // gap de sincronização é alunos ativos com cobrança (problema real) ou só
  // inativos/sem cobrança (não é problema). `limite` corta quantos "faltando"
  // são checados ao vivo (cada checagem é uma chamada à Sophia, então o
  // total pode demorar minutos sem limite).
  @Get('sophia/diagnostico-cobertura')
  async diagnosticoCobertura(@Query('limite') limiteStr?: string) {
    const limite = limiteStr ? parseInt(limiteStr, 10) : 300;
    const [alunos, codigosCache] = await Promise.all([
      this.sophia.getAllAlunos(),
      this.financeiroService.getCodigosSophiaCache(),
    ]);

    const faltando = alunos.filter((a) => !codigosCache.has(a.codigo));
    const amostra = faltando.slice(0, limite);

    const comCobrancaPendente: {
      codigo: number;
      nome: string;
      qtdPendente: number;
    }[] = [];
    let semCobranca = 0;
    let erros = 0;

    for (const aluno of amostra) {
      try {
        const lancamentos = await this.sophia.getLancamentosAluno(aluno.codigo);
        const pendentes = lancamentos.filter((l) => l.recebido <= 0);
        if (pendentes.length > 0) {
          comCobrancaPendente.push({
            codigo: aluno.codigo,
            nome: aluno.nome,
            qtdPendente: pendentes.length,
          });
        } else {
          semCobranca++;
        }
      } catch {
        erros++;
      }
    }

    return {
      totalAlunosSophia: alunos.length,
      totalNoCache: codigosCache.size,
      totalFaltando: faltando.length,
      checados: amostra.length,
      comCobrancaPendente,
      semCobranca,
      erros,
    };
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
      // Canal dedicado da régua de cobrança (whatsapp-job) -- enquanto não
      // configurado, o job de cobrança usa o canal "geral" acima mesmo (ver
      // fallback em WhatsAppService.credenciais).
      zapiFinanceiroInstanceIdConfigurada: !!this.config.get<string>(
        'zapi.financeiro.instanceId',
      ),
      zapiFinanceiroTokenConfigurada: !!this.config.get<string>(
        'zapi.financeiro.token',
      ),
      zapiFinanceiroClientTokenConfigurada: !!this.config.get<string>(
        'zapi.financeiro.clientToken',
      ),
      telefoneFinanceiroConfigurado: !!this.config.get<string>(
        'zapi.telefoneFinanceiro',
      ),
      diasAntes: this.config.get<number[]>('zapi.diasAntes'),
      diasApos: this.config.get<number[]>('zapi.diasApos'),
    };
  }

  /** Chama a Z-API de verdade pra saber se a sessão do WhatsApp está pareada — independe de qualquer envio. `?canal=financeiro` checa o número dedicado de cobrança em vez do de atendimento. */
  @Get('whatsapp/conexao')
  diagnosticoWhatsappConexao(@Query('canal') canal?: string) {
    return this.whatsapp.verificarConexao(
      canal === 'financeiro' ? 'financeiro' : 'geral',
    );
  }
}
