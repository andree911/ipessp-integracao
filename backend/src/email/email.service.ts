import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

@Injectable()
export class EmailService implements OnModuleInit {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('email.host'),
      port: this.config.get<number>('email.port') ?? 587,
      secure: this.config.get<boolean>('email.secure') ?? false,
      auth: {
        user: this.config.get<string>('email.user'),
        pass: this.config.get<string>('email.pass'),
      },
    });
  }

  async enviar(para: string, assunto: string, html: string): Promise<void> {
    const from = this.config.get<string>('email.from');
    await this.transporter.sendMail({ from, to: para, subject: assunto, html });
    this.logger.log(`Email enviado → ${para} | ${assunto}`);
  }

  async verificarConexao(): Promise<boolean> {
    try {
      await this.transporter.verify();
      this.logger.log('Conexão SMTP verificada com sucesso');
      return true;
    } catch (err: any) {
      this.logger.error(`Falha na conexão SMTP: ${err.message}`);
      return false;
    }
  }
}
