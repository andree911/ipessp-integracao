import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { EmailService } from '../email/email.service';
import { errMsg } from '../common/err.util';
import {
  escHtml,
  renderInternalNotificationEmail,
} from '../common/internal-notification.util';
import { MensagemContato } from './entities/mensagem-contato.entity';
import { Manifestacao } from './entities/manifestacao.entity';
import { SolicitacaoEvento } from './entities/solicitacao-evento.entity';
import { MensagemContatoDto } from './dto/mensagem-contato.dto';
import { ManifestacaoDto } from './dto/manifestacao.dto';
import { SolicitacaoEventoDto } from './dto/solicitacao-evento.dto';

const TIPO_LABEL: Record<string, string> = {
  reclamacao: 'Reclamação',
  sugestao: 'Sugestão',
  elogio: 'Elogio',
  outro: 'Outro',
};

@Injectable()
export class FormulariosService {
  private readonly logger = new Logger(FormulariosService.name);

  constructor(
    @InjectRepository(MensagemContato)
    private readonly contatoRepo: Repository<MensagemContato>,
    @InjectRepository(Manifestacao)
    private readonly manifestacaoRepo: Repository<Manifestacao>,
    @InjectRepository(SolicitacaoEvento)
    private readonly eventoRepo: Repository<SolicitacaoEvento>,
    private readonly emailService: EmailService,
    private readonly config: ConfigService,
  ) {}

  private get emailDestino(): string {
    return (
      this.config.get<string>('email.emailNotificacoes') ||
      this.config.get<string>('email.from') ||
      ''
    );
  }

  private get nomeEscola(): string {
    return this.config.get<string>('email.nomeEscola') ?? 'IPESSP';
  }

  async criarContato(dto: MensagemContatoDto): Promise<MensagemContato> {
    const registro = await this.contatoRepo.save(this.contatoRepo.create(dto));

    void this.notificar(
      `[${this.nomeEscola}] Novo contato: ${dto.assunto ?? 'sem assunto'}`,
      `
        <p><strong>Nome:</strong> ${escHtml(dto.nome)}</p>
        <p><strong>E-mail:</strong> ${escHtml(dto.email)}</p>
        ${dto.telefone ? `<p><strong>Telefone:</strong> ${escHtml(dto.telefone)}</p>` : ''}
        ${dto.assunto ? `<p><strong>Assunto:</strong> ${escHtml(dto.assunto)}</p>` : ''}
        <p><strong>Mensagem:</strong></p>
        <p>${escHtml(dto.mensagem)}</p>
      `,
    );

    return registro;
  }

  async criarManifestacao(dto: ManifestacaoDto): Promise<Manifestacao> {
    const registro = await this.manifestacaoRepo.save(
      this.manifestacaoRepo.create({
        ...dto,
        tipo: dto.tipo as Manifestacao['tipo'],
      }),
    );

    void this.notificar(
      `[${this.nomeEscola}] Ouvidoria — ${TIPO_LABEL[dto.tipo] ?? dto.tipo}`,
      `
        <p><strong>Tipo:</strong> ${TIPO_LABEL[dto.tipo] ?? escHtml(dto.tipo)}</p>
        <p><strong>Nome:</strong> ${escHtml(dto.nome)}</p>
        <p><strong>E-mail:</strong> ${escHtml(dto.email)}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${escHtml(dto.mensagem)}</p>
      `,
    );

    return registro;
  }

  async criarSolicitacaoEvento(
    dto: SolicitacaoEventoDto,
  ): Promise<SolicitacaoEvento> {
    const registro = await this.eventoRepo.save(this.eventoRepo.create(dto));

    void this.notificar(
      `[${this.nomeEscola}] Solicitação de espaço para evento`,
      `
        <p><strong>Nome:</strong> ${escHtml(dto.nome)}</p>
        <p><strong>E-mail:</strong> ${escHtml(dto.email)}</p>
        ${dto.telefone ? `<p><strong>Telefone:</strong> ${escHtml(dto.telefone)}</p>` : ''}
        ${dto.organizacao ? `<p><strong>Organização:</strong> ${escHtml(dto.organizacao)}</p>` : ''}
        ${dto.tipoEvento ? `<p><strong>Tipo de evento:</strong> ${escHtml(dto.tipoEvento)}</p>` : ''}
        ${dto.dataEvento ? `<p><strong>Data do evento:</strong> ${escHtml(dto.dataEvento)}</p>` : ''}
        <p><strong>Descrição:</strong></p>
        <p>${escHtml(dto.descricao)}</p>
      `,
    );

    return registro;
  }

  private async notificar(assunto: string, corpo: string): Promise<void> {
    const para = this.emailDestino;
    if (!para) return;
    try {
      const html = renderInternalNotificationEmail({
        nomeEscola: this.nomeEscola,
        titulo: assunto,
        corpoHtml: corpo,
      });
      await this.emailService.enviar(para, assunto, html);
    } catch (err: unknown) {
      this.logger.warn(
        `Falha ao notificar por email (${assunto}): ${errMsg(err)}`,
      );
    }
  }
}
