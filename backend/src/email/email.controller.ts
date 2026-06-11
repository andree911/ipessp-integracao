import { Controller, Post, Get, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailJobService } from './email-job.service';
import { EmailService } from './email.service';
import { EmailLog } from './entities/email-log.entity';

@Controller('email')
export class EmailController {
  constructor(
    private readonly jobService: EmailJobService,
    private readonly emailService: EmailService,
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
}
