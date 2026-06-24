import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { ResponsavelCache } from './entities/responsavel-cache.entity';
import { TelefoneCpfCache } from './entities/telefone-cpf-cache.entity';
import { SupabaseService } from './supabase.service';
import { CriarProspectivoDto } from './dto/prospectivo.dto';
import { CriarResponsavelDto } from './dto/criar-responsavel.dto';
import { MatricularAlunoDto } from './dto/matricular-aluno.dto';
import { AssociarTelefoneDto } from './dto/associar-telefone.dto';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(
    private readonly sophia: SophiaService,
    private readonly financeiro: FinanceiroService,
    private readonly supabase: SupabaseService,
    @InjectRepository(ResponsavelCache)
    private readonly cacheRepo: Repository<ResponsavelCache>,
    @InjectRepository(TelefoneCpfCache)
    private readonly telefoneCpfRepo: Repository<TelefoneCpfCache>,
  ) {}

  async getFinanceiroByCpf(cpf: string) {
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (!cpfNumeros) throw new NotFoundException('CPF inválido');

    const dados = await this.financeiro.getByCpf(cpfNumeros);

    return [{
      aluno: { nome: dados.nomeAluno },
      responsavel: { nome: dados.nomeResponsavel, email: dados.emailResponsavel },
      pendencias: dados.pendencias.map((p) => ({
        codigo: p.codigo,
        descricao: p.descricao,
        vencimento: p.vencimento,
        valor: p.valor,
        linhaDigitavel: p.linhaDigitavel ?? null,
        urlBoleto: p.urlBoleto ?? null,
        pix: p.codigoPix ?? null,
      })),
      totalPendente: dados.pendencias.reduce((s, p) => s + p.valor, 0),
    }];
  }

  async getAvisos() {
    const sb = this.supabase.getClient();
    if (!sb) return [];

    const { data, error } = await sb
      .from('avisos')
      .select('id, titulo, mensagem, criado_em')
      .eq('ativo', true)
      .order('criado_em', { ascending: false });

    if (error) {
      this.logger.error(`Erro ao buscar avisos: ${error.message}`);
      return [];
    }
    return data ?? [];
  }

  async getCalendario() {
    const sb = this.supabase.getClient();
    if (!sb) return [];

    const hoje = new Date().toISOString().substring(0, 10);
    const { data, error } = await sb
      .from('calendario')
      .select('id, titulo, descricao, data_evento, tipo')
      .gte('data_evento', hoje)
      .order('data_evento', { ascending: true });

    if (error) {
      this.logger.error(`Erro ao buscar calendário: ${error.message}`);
      return [];
    }
    return data ?? [];
  }

  async criarProspectivo(dto: CriarProspectivoDto) {
    return this.sophia.criarCliente(dto);
  }

  async criarResponsavel(dto: CriarResponsavelDto) {
    const cpfNumeros = dto.cpfAluno.replace(/\D/g, '');
    const registros = await this.cacheRepo.find({ where: { cpf: cpfNumeros } });
    if (registros.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado. Verifique se o CPF está cadastrado no sistema.',
      );
    }

    // Usa o primeiro registro para obter o codigoAluno (todos compartilham o mesmo CPF de responsável)
    const { codigoAluno, nomeAluno } = registros[0];

    const resultado = await this.sophia.criarResponsavelAluno(codigoAluno, {
      nome: dto.nome,
      cpf: dto.cpf,
      email: dto.email,
      telefone: dto.telefone,
      responsavelFinanceiro: dto.responsavelFinanceiro ?? false,
      responsavelPedagogico: dto.responsavelPedagogico ?? false,
      tipoVinculo: dto.tipoParentesco
        ? { tipoParentesco: dto.tipoParentesco }
        : undefined,
    });

    if (dto.responsavelFinanceiro && resultado.codigo) {
      await this.sophia.vincularResponsavelFinanceiro(codigoAluno, resultado.codigo);
    }

    // Atualiza o cache inline para que /ia/financeiro já funcione sem esperar o cron
    if (dto.responsavelFinanceiro && dto.cpf) {
      const novoCpf = dto.cpf.replace(/\D/g, '');
      await this.cacheRepo.upsert(
        {
          cpf: novoCpf,
          codigoAluno,
          nomeAluno,
          codigoResponsavel: resultado.codigo,
          nomeResponsavel: resultado.nome,
          email: resultado.email ?? null,
        } as ResponsavelCache,
        ['cpf', 'codigoAluno'],
      );
      this.logger.log(`Cache IA atualizado inline: CPF ${novoCpf} → aluno ${codigoAluno}`);
    }

    return {
      ok: true,
      codigoResponsavel: resultado.codigo,
      codigoAluno,
      nomeAluno,
      responsavelFinanceiro: dto.responsavelFinanceiro ?? false,
    };
  }

  async matricularAluno(dto: MatricularAlunoDto) {
    const resultado = await this.sophia.matricularAluno(dto.codigoAluno, {
      unidade: dto.unidade,
      curso: dto.curso,
      turno: dto.turno,
      periodoLetivo: dto.periodoLetivo,
      curriculo: dto.curriculo,
      valorPrimeiraParcela: dto.valorPrimeiraParcela,
      dataPagamento: dto.dataPagamento,
      descontoMensalidade: dto.descontoMensalidade,
    });

    this.logger.log(`Matrícula criada no SophiA: aluno ${dto.codigoAluno}, curso ${dto.curso}`);
    return resultado;
  }

  async associarTelefoneCpf(dto: AssociarTelefoneDto) {
    const telefone = dto.telefone.replace(/\D/g, '');
    const cpf = dto.cpf.replace(/\D/g, '');

    await this.telefoneCpfRepo.upsert(
      { telefone, cpf, nomeResponsavel: dto.nomeResponsavel ?? null, tipo: dto.tipo ?? null } as TelefoneCpfCache,
      ['telefone'],
    );

    this.logger.log(`Associação telefone→CPF gravada: ${telefone}`);
    return { ok: true, telefone, cpf };
  }

  async getCpfPorTelefone(telefone: string) {
    const tel = telefone.replace(/\D/g, '');
    const registro = await this.telefoneCpfRepo.findOne({ where: { telefone: tel } });
    if (!registro) throw new NotFoundException('Nenhum CPF associado a este número de telefone');
    return { telefone: registro.telefone, cpf: registro.cpf, nomeResponsavel: registro.nomeResponsavel, tipo: registro.tipo ?? null };
  }
}
