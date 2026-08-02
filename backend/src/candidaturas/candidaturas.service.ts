import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { errMsg } from '../common/err.util';
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

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

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

  async criar(dto: CandidaturaDto, file?: Express.Multer.File): Promise<Candidatura> {
    let curriculoUrl: string | undefined;
    let curriculoNome: string | undefined;

    if (file) {
      curriculoNome = file.originalname;
      const path = `curriculos/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;
      curriculoUrl = await this.storage.upload('candidaturas', path, file.buffer, file.mimetype).catch((err) => {
        this.logger.warn(`Falha ao subir currículo no storage: ${err.message}`);
        return undefined;
      });
    }

    const registro = await this.repo.save(
      this.repo.create({ ...dto, curriculoUrl, curriculoNome }),
    );

    void this.notificar(dto, file);

    return registro;
  }

  private async notificar(dto: CandidaturaDto, file?: Express.Multer.File): Promise<void> {
    const para = this.config.get<string>('email.emailNotificacoes') || this.config.get<string>('email.from') || '';
    if (!para) return;

    const nomeEscola = this.config.get<string>('email.nomeEscola') ?? 'IPESSP';
    const areaLabel = AREA_LABEL[dto.area] ?? dto.area;
    const assunto = `[${nomeEscola}] Nova candidatura — ${areaLabel}`;
    const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:24px;color:#333;">
      <h2 style="color:#C8102E;">${assunto}</h2>
      <p><strong>Nome:</strong> ${esc(dto.nome)}</p>
      <p><strong>E-mail:</strong> ${esc(dto.email)}</p>
      <p><strong>Área:</strong> ${areaLabel}</p>
      ${dto.mensagem ? `<p><strong>Mensagem:</strong></p><p>${esc(dto.mensagem)}</p>` : ''}
      <hr style="margin-top:24px;border:none;border-top:1px solid #eee;">
      <p style="font-size:11px;color:#999;">Enviado automaticamente pelo sistema ${nomeEscola}</p>
    </body></html>`;

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
