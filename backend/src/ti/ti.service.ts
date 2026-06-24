import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chamado } from './entities/chamado.entity';
import { CriarChamadoDto } from './dto/criar-chamado.dto';

@Injectable()
export class TiService {
  private readonly logger = new Logger(TiService.name);

  constructor(
    @InjectRepository(Chamado)
    private readonly chamadoRepo: Repository<Chamado>,
  ) {}

  async criarChamado(dto: CriarChamadoDto) {
    const telefone = dto.telefoneSolicitante.replace(/\D/g, '');
    const chamado = this.chamadoRepo.create({
      titulo: dto.titulo,
      descricao: dto.descricao,
      categoria: dto.categoria ?? 'Outro',
      prioridade: dto.prioridade ?? 'media',
      criadoPorEmail: 'bot@ipessp.edu.br',
      criadoPorNome: dto.criadoPorNome ?? 'Bot WhatsApp',
      setor: dto.setor ?? null,
      telefoneSolicitante: telefone,
    });

    const saved = await this.chamadoRepo.save(chamado) as Chamado;
    const ref = `CH-${saved.id.substring(0, 8).toUpperCase()}`;

    this.logger.log(`Chamado ${ref} aberto por ${telefone}`);
    return { ref, status: saved.status, criadoEm: saved.createdAt };
  }

  async listarPorTelefone(telefone: string) {
    const tel = telefone.replace(/\D/g, '');
    const chamados = await this.chamadoRepo.find({
      where: { telefoneSolicitante: tel },
      order: { createdAt: 'DESC' },
      take: 5,
    });
    if (!chamados.length) throw new NotFoundException('Nenhum chamado encontrado para este número');
    return chamados.map(c => ({
      ref: `CH-${c.id.substring(0, 8).toUpperCase()}`,
      titulo: c.titulo,
      status: c.status,
      criadoEm: c.createdAt,
    }));
  }
}
