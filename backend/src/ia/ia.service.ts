import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { ResponsavelCache } from './entities/responsavel-cache.entity';
import { SupabaseService } from './supabase.service';
import { CriarProspectivoDto } from './dto/prospectivo.dto';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(
    private readonly sophia: SophiaService,
    private readonly supabase: SupabaseService,
    @InjectRepository(ResponsavelCache)
    private readonly cacheRepo: Repository<ResponsavelCache>,
  ) {}

  async getFinanceiroByCpf(cpf: string) {
    const cpfNumeros = cpf.replace(/\D/g, '');
    if (!cpfNumeros) throw new NotFoundException('CPF inválido');

    const registros = await this.cacheRepo.find({ where: { cpf: cpfNumeros } });
    if (registros.length === 0) {
      throw new NotFoundException(
        'Nenhum aluno encontrado para o CPF informado. Verifique se o CPF do responsável financeiro está cadastrado no sistema.',
      );
    }

    const resultado: object[] = [];
    for (const reg of registros) {
      const lancamentos = await this.sophia.getLancamentosAluno(reg.codigoAluno);
      const pendencias = lancamentos
        .filter((l) => l.recebido === 0)
        .map((l) => ({
          codigo: l.codigo,
          descricao: l.descricao ?? 'Mensalidade',
          vencimento: l.dataVencimento.substring(0, 10),
          valor: l.valorPrevisto,
          linhaDigitavel: l.linhaDigitavel ?? null,
          urlBoleto: l.urlBoletoDigital ?? null,
          pix: l.codigoPix ?? null,
        }));

      resultado.push({
        aluno: { codigo: reg.codigoAluno, nome: reg.nomeAluno },
        responsavel: {
          codigo: reg.codigoResponsavel,
          nome: reg.nomeResponsavel,
          email: reg.email ?? null,
        },
        pendencias,
        totalPendente: pendencias.reduce((s, l) => s + l.valor, 0),
      });
    }

    return resultado;
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
}
