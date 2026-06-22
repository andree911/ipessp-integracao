import { Controller, Post, Get, HttpCode, Body, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailJobService } from './email-job.service';
import { EmailService } from './email.service';
import { EmailLog } from './entities/email-log.entity';
import { templateLembrete } from './templates/email.templates';

@Controller('email')
export class EmailController {
  constructor(
    private readonly jobService: EmailJobService,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    @InjectRepository(EmailLog)
    private readonly emailLogRepo: Repository<EmailLog>,
  ) {}

  @Post('trigger')
  @HttpCode(202)
  trigger(): { message: string } {
    void this.jobService.runEmailJob();
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
  async testarSophia(@Body('para') para: string): Promise<{ ok: boolean; aluno: string; tipo: string; lancamento: number }> {
    if (!para) throw new BadRequestException('Informe o campo "para" com o email de destino');
    const resultado = await this.jobService.previewComDadosSophia(para);
    return { ok: true, ...resultado };
  }

  @Post('test/cpf')
  @HttpCode(200)
  async testarPorCpf(
    @Body('cpf') cpf: string,
    @Body('para') para: string,
  ): Promise<{ ok: boolean; aluno: string; tipo: string; lancamento: number }> {
    if (!cpf) throw new BadRequestException('Informe o campo "cpf"');
    if (!para) throw new BadRequestException('Informe o campo "para" com o email de destino');
    const resultado = await this.jobService.previewPorCpf(cpf, para);
    return { ok: true, ...resultado };
  }

  @Post('test')
  @HttpCode(200)
  async testar(@Body('para') para: string): Promise<{ ok: boolean; para: string }> {
    if (!para) throw new BadRequestException('Informe o campo "para" com o email de destino');
    const { subject, html } = templateLembrete({
      nomeAluno: 'André Nicézio (Teste)',
      nomeResponsavel: 'André Nicézio',
      descricao: 'Mensalidade — Pós-Graduação em Análises Clínicas',
      valor: 'R$ 890,00',
      vencimento: new Date(Date.now() + 3 * 86400000).toLocaleDateString('pt-BR'),
      diasRestantes: 3,
      codigoBarras: '34191.09008 63521.109002 61703.590000 6 00000000089000',
      codigoPix: '00020126580014BR.GOV.BCB.PIX0136test-chave-pix-exemplo5204000053039865802BR5925IPESSP6008SAOPAULO62070503***6304ABCD',
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
