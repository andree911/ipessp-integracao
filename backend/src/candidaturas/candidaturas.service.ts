import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { errMsg } from '../common/err.util';
import {
  escHtml,
  renderInternalNotificationEmail,
} from '../common/internal-notification.util';
import { StorageService } from '../common/storage.service';
import { EmailService } from '../email/email.service';
import { Candidatura } from './entities/candidatura.entity';
import { CandidaturaDto } from './dto/candidatura.dto';

const AREA_LABEL: Record<string, string> = {
  monitoria: 'Monitoria',
  docencia: 'Docência / Professor Convidado',
  laboratorio: 'Técnico de Laboratório',
  administrativo: 'Administrativo / Secretaria',
  outro: 'Outro',
};

@Injectable()
export class CandidaturasService {
  private readonly logger = new Logger(CandidaturasService.name);

  constructor(
    @InjectRepository(Candidatura)
    private readonly repo: Repository<Candidatura>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
    private readonly storage: StorageService,
  ) {}

  async criar(
    dto: CandidaturaDto,
    file?: Express.Multer.File,
  ): Promise<Candidatura> {
    let curriculoUrl: string | undefined;
    let curriculoNome: string | undefined;

    if (file) {
      curriculoNome = file.originalname;
      const path = `curriculos/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
      curriculoUrl = await this.storage
        .upload('candidaturas', path, file.buffer, file.mimetype)
        .catch((err: unknown) => {
          this.logger.warn(
            `Falha ao subir currículo no storage: ${errMsg(err)}`,
          );
          return undefined;
        });
    }

    const registro = await this.repo.save(
      this.repo.create({ ...dto, curriculoUrl, curriculoNome }),
    );

    void this.notificar(dto, file);

    return registro;
  }

  private async notificar(
    dto: CandidaturaDto,
    file?: Express.Multer.File,
  ): Promise<void> {
    const para =
      this.config.get<string>('email.emailNotificacoes') ||
      this.config.get<string>('email.from') ||
      '';
    if (!para) return;

    const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'IPESSP';
    const areaLabel = AREA_LABEL[dto.area] ?? dto.area;
    const assunto = `[${nomeEscola}] Nova candidatura — ${areaLabel}`;
    const html = renderInternalNotificationEmail({
      nomeEscola,
      titulo: assunto,
      corpoHtml: `
        <p><strong>Nome:</strong> ${escHtml(dto.nome)}</p>
        <p><strong>E-mail:</strong> ${escHtml(dto.email)}</p>
        <p><strong>Área:</strong> ${escHtml(areaLabel)}</p>
        ${dto.mensagem ? `<p><strong>Mensagem:</strong></p><p>${escHtml(dto.mensagem)}</p>` : ''}
      `,
    });

    try {
      if (file) {
        await this.emailService.enviarComAnexo(para, assunto, html, {
          nome: file.originalname,
          buffer: file.buffer,
          tipo: file.mimetype,
        });
      } else {
        await this.emailService.enviar(para, assunto, html);
      }
    } catch (err: unknown) {
      this.logger.warn(`Falha ao notificar candidatura: ${errMsg(err)}`);
    }
  }
}
