import {
  Controller,
  Post,
  Get,
  HttpCode,
  Body,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailJobService } from './email-job.service';
import { EmailService } from './email.service';
import { WhatsAppJobService } from './whatsapp-job.service';
import { EmailLog } from './entities/email-log.entity';
import { templateLembrete } from './templates/email.templates';
import { errMsg } from '../common/err.util';
import { AdminApiKeyGuard } from '../admin/guards/admin-api-key.guard';

@UseGuards(AdminApiKeyGuard)
@Controller('email')
export class EmailController {
  constructor(
    private readonly jobService: EmailJobService,
    private readonly emailService: EmailService,
    private readonly whatsappJobService: WhatsAppJobService,
    private readonly config: ConfigService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
  ) {}

  @Post('trigger')
  @HttpCode(202)
  trigger(): { message: string } {
    void this.jobService.runEmailJob('manual');
    return { message: 'Job de emails iniciado' };
  }

  @Get('status')
  async status() {
    const [total, enviados, erros] = await Promise.all([
      this.emailLogRepo.count(),
      this.emailLogRepo.count({ where: { enviado: true } }),
      this.emailLogRepo.count({ where: { enviado: false } }),
    ]);
    return { total, enviados, erros };
  }

  @Get('smtp/check')
  async smtpCheck(): Promise<{ ok: boolean }> {
    const ok = await this.emailService.verificarConexao();
    return { ok };
  }

  @Post('test/sophia')
  @HttpCode(200)
  async testarSophia(
    @Body('para') para: string,
    @Body('diasSimulados') diasSimulados?: number,
    @Body('somenteComCodigo') somenteComCodigo?: boolean,
  ): Promise<{
    ok: boolean;
    total: number;
    enviados: { aluno: string; tipo: string; lancamento: number }[];
  }> {
    if (!para)
      throw new BadRequestException(
        'Informe o campo "para" com o email de destino',
      );
    const enviados = await this.jobService.previewComDadosSophia(
      para,
      diasSimulados,
      somenteComCodigo,
    );
    return { ok: true, total: enviados.length, enviados };
  }

  @Post('test/cpf')
  @HttpCode(200)
  async testarPorCpf(
    @Body('cpf') cpf: string,
    @Body('para') para: string,
    @Body('diasSimulados') diasSimulados?: number,
  ): Promise<{
    ok: boolean;
    enviados: { aluno: string; tipo: string; lancamento: number }[];
  }> {
    if (!cpf) throw new BadRequestException('Informe o campo "cpf"');
    if (!para)
      throw new BadRequestException(
        'Informe o campo "para" com o email de destino',
      );
    try {
      // Pode vir mais de um resultado no mesmo dia (ex.: lembrete + aviso disparando juntos).
      const enviados = await this.jobService.previewPorCpf(
        cpf,
        para,
        diasSimulados,
      );
      return { ok: true, enviados };
    } catch (err: unknown) {
      const msg = errMsg(err);
      if (msg.includes('não encontrado na cache'))
        throw new NotFoundException(msg);
      if (msg.includes('não possui lançamentos'))
        throw new NotFoundException(msg);
      throw new InternalServerErrorException(msg);
    }
  }

  @Post('test/lancamento')
  @HttpCode(200)
  async testarPorLancamento(
    @Body('codigoLancamento', ParseIntPipe) codigoLancamento: number,
    @Body('para') para: string,
    @Body('diasSimulados') diasSimulados?: number,
  ): Promise<{
    ok: boolean;
    enviados: { aluno: string; tipo: string; lancamento: number }[];
  }> {
    if (!para)
      throw new BadRequestException(
        'Informe o campo "para" com o email de destino',
      );
    try {
      // Pode vir mais de um resultado no mesmo dia (ex.: lembrete + aviso disparando juntos).
      const enviados = await this.jobService.previewPorLancamento(
        codigoLancamento,
        para,
        diasSimulados,
      );
      return { ok: true, enviados };
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 404) throw err;
      throw new InternalServerErrorException(errMsg(err));
    }
  }

  @Post('test/whatsapp-cpf')
  @HttpCode(200)
  async testarWhatsappPorCpf(
    @Body('cpf') cpf: string,
    @Body('para') para: string,
    @Body('diasSimulados') diasSimulados?: number,
  ): Promise<{
    ok: boolean;
    enviados: { aluno: string; tipo: string; lancamento: number }[];
  }> {
    if (!cpf) throw new BadRequestException('Informe o campo "cpf"');
    if (!para)
      throw new BadRequestException(
        'Informe o campo "para" com o número de WhatsApp de destino',
      );
    try {
      const enviados = await this.whatsappJobService.previewPorCpf(
        cpf,
        para,
        diasSimulados,
      );
      return { ok: true, enviados };
    } catch (err: unknown) {
      const msg = errMsg(err);
      if (msg.includes('Nenhum aluno encontrado'))
        throw new NotFoundException(msg);
      if (msg.includes('não possui lançamentos'))
        throw new NotFoundException(msg);
      throw new InternalServerErrorException(msg);
    }
  }

  @Post('test/whatsapp-lancamento')
  @HttpCode(200)
  async testarWhatsappPorLancamento(
    @Body('codigoLancamento', ParseIntPipe) codigoLancamento: number,
    @Body('para') para: string,
    @Body('diasSimulados') diasSimulados?: number,
  ): Promise<{
    ok: boolean;
    enviados: { aluno: string; tipo: string; lancamento: number }[];
  }> {
    if (!para)
      throw new BadRequestException(
        'Informe o campo "para" com o número de WhatsApp de destino',
      );
    try {
      const enviados = await this.whatsappJobService.previewPorLancamento(
        codigoLancamento,
        para,
        diasSimulados,
      );
      return { ok: true, enviados };
    } catch (err: unknown) {
      if ((err as { status?: number }).status === 404) throw err;
      throw new InternalServerErrorException(errMsg(err));
    }
  }

  @Post('whatsapp/resposta-opcao')
  @HttpCode(200)
  async whatsappRespostaOpcao(
    @Body('selectedRowId') selectedRowId: string,
    @Body('telefone') telefone: string,
  ): Promise<{ ok: boolean; mensagem: string }> {
    if (!selectedRowId)
      throw new BadRequestException('Informe o campo "selectedRowId"');
    if (!telefone) throw new BadRequestException('Informe o campo "telefone"');
    const { mensagem } = await this.whatsappJobService.responderOpcaoCobranca(
      selectedRowId,
      telefone,
    );
    return { ok: true, mensagem };
  }

  @Post('test')
  @HttpCode(200)
  async testar(
    @Body('para') para: string,
  ): Promise<{ ok: boolean; para: string }> {
    if (!para)
      throw new BadRequestException(
        'Informe o campo "para" com o email de destino',
      );
    const { subject, html } = templateLembrete({
      nomeAluno: 'André Nicézio (Teste)',
      nomeResponsavel: 'André Nicézio',
      descricao: 'Mensalidade — Pós-Graduação em Análises Clínicas',
      valor: 'R$ 890,00',
      vencimento: new Date(Date.now() + 3 * 86400000).toLocaleDateString(
        'pt-BR',
      ),
      diasRestantes: 3,
      codigoBarras: '34191.09008 63521.109002 61703.590000 6 00000000089000',
      codigoPix:
        '00020126580014BR.GOV.BCB.PIX0136test-chave-pix-exemplo5204000053039865802BR5925IPESSP6008SAOPAULO62070503***6304ABCD',
      codigoMatricula: '12345',
      competencia: 'Junho/2026',
      nomeEscola: this.config.get('EMAIL_NOME_ESCOLA') ?? 'IPESSP',
      emailEscola: this.config.get('EMAIL_FROM') ?? 'marketing@ipessp.edu.br',
      telefoneEscola: '(11) 97692-2127',
      logoUrl: this.config.get('EMAIL_LOGO_URL'),
      siteUrl: 'https://ipessp.edu.br',
      instagramUrl: 'https://www.instagram.com/ipessp/',
      linkedinUrl: 'https://www.linkedin.com/company/ipessp---educa-o/',
      facebookUrl: 'https://www.facebook.com/ipesspedu/',
      youtubeUrl: 'https://www.youtube.com/channel/UC7dgP6NBgM9L0m11UbhCyHg',
    });
    await this.emailService.enviar(para, subject, html);
    return { ok: true, para };
  }
}
