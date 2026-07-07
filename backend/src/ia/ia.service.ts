import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SophiaService } from '../sophia/sophia.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { WhatsAppService } from '../email/whatsapp.service';
import { ResponsavelCache } from './entities/responsavel-cache.entity';
import { TelefoneCpfCache } from './entities/telefone-cpf-cache.entity';
import { SupabaseService } from './supabase.service';
import { AssociarTelefoneDto } from './dto/associar-telefone.dto';

@Injectable()
export class IaService {
  private readonly logger = new Logger(IaService.name);

  constructor(
    private readonly sophia: SophiaService,
    private readonly financeiro: FinanceiroService,
    private readonly whatsapp: WhatsAppService,
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
        codigoBoleto: p.codigoBoleto ?? null,
      })),
      totalPendente: dados.pendencias.reduce((s, p) => s + p.valor, 0),
    }];
  }

  /**
   * Baixa o PDF do boleto no Sophia e devolve em base64, pronto pra IA
   * anexar como documento na conversa do WhatsApp (nó de envio de
   * documento da Z-API aceita base64 direto, sem precisar de URL pública).
   */
  async getBoletoPdf(cpf: string, codigoBoleto: number): Promise<{ base64: string; fileName: string; mimeType: string }> {
    const { codigoAluno } = await this.financeiro.getBoletoInfo(cpf, codigoBoleto);
    const pdf = await this.sophia.getBoleto(codigoAluno, codigoBoleto);
    return {
      base64: pdf.toString('base64'),
      fileName: `boleto-${codigoBoleto}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  /** Busca o PDF do boleto e manda direto pro WhatsApp do próprio usuário — usado pela tool do bot. */
  async enviarBoletoWhatsapp(cpf: string, codigoBoleto: number, telefone: string): Promise<{ ok: boolean }> {
    const { base64, fileName } = await this.getBoletoPdf(cpf, codigoBoleto);
    await this.whatsapp.enviarDocumento(telefone, base64, fileName);
    return { ok: true };
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

  async getSecretariaByCpf(cpf: string) {
    const cpfNumeros = cpf.replace(/\D/g, '');
    const registros = await this.cacheRepo.find({ where: { cpf: cpfNumeros } });
    if (registros.length === 0) throw new NotFoundException('Aluno não encontrado para este CPF');

    const { codigoAluno, nomeAluno } = registros[0];
    const matriculas = await this.sophia.getMatriculasAluno(codigoAluno);

    return {
      nomeAluno,
      matriculas: matriculas.map((m) => ({
        codigo: m.codigoMatricula,
        curso: m.nomeSerie ?? null,
        turma: m.nomeTurma ?? null,
        unidade: m.nomeUnidade ?? null,
        situacao: m.situacao ?? null,
        dataMatricula: m.dataMatricula ?? null,
      })),
    };
  }

  async getProfessorByEmail(email: string) {
    const colaboradores = await this.sophia.getColaboradores({ Email: email });
    if (!colaboradores.length) throw new NotFoundException('Professor não encontrado para este email');

    const professor = colaboradores[0];
    const hoje = new Date().toISOString().substring(0, 10);
    const listas = await this.sophia.getListaChamadaProfessor(professor.codigo);

    const proximas = listas
      .filter(l => l.dataListaChamada >= hoje)
      .sort((a, b) => a.dataListaChamada.localeCompare(b.dataListaChamada))
      .slice(0, 20);

    const turmas = [...new Map(listas.map(l => [l.codigoTurma, { codigoTurma: l.codigoTurma, turma: l.turma }])).values()];

    return {
      nome: professor.nome,
      email: professor.email ?? email,
      turmas,
      cronograma: proximas.map(l => ({
        idLista: l.codigoLista,
        turma: l.turma,
        disciplina: l.disciplina,
        data: l.dataListaChamada,
        horaInicio: l.horaInicio,
        horaFinal: l.horaFinal,
        status: l.status,
      })),
    };
  }

  async getAlunosPorLista(idLista: number) {
    const alunos = await this.sophia.getAlunosListaChamada(idLista);
    return alunos;
  }

  async getCursos() {
    const [cursos, conteudo] = await Promise.all([
      this.sophia.getCursos() as Promise<Array<{ codigo: number; nome: string; nomeResumido: string }>>,
      this.getCursosConteudo(),
    ]);

    const conteudoPorCodigo = new Map(conteudo.map((c) => [c.codigo_curso, c]));

    return cursos.map((curso) => {
      const extra = conteudoPorCodigo.get(curso.codigo);
      return {
        codigo: curso.codigo,
        nome: curso.nome,
        nomeResumido: curso.nomeResumido,
        descricao: extra?.descricao ?? null,
        duracao: extra?.duracao ?? null,
        precoMensalidade: extra?.preco_mensalidade ?? null,
      };
    });
  }

  private async getCursosConteudo() {
    const sb = this.supabase.getClient();
    if (!sb) return [];

    const { data, error } = await sb
      .from('curso_conteudo')
      .select('codigo_curso, descricao, duracao, preco_mensalidade')
      .eq('ativo', true);

    if (error) {
      this.logger.error(`Erro ao buscar conteúdo de cursos: ${error.message}`);
      return [];
    }
    return data ?? [];
  }

  async getTurmaDetalhada(codigoTurma: number) {
    return this.sophia.getTurmaDetalhada(codigoTurma);
  }

  async associarTelefoneCpf(dto: AssociarTelefoneDto) {
    const telefone = dto.telefone.replace(/\D/g, '');
    const cpf = dto.cpf.replace(/\D/g, '');

    await this.telefoneCpfRepo.upsert(
      { telefone, cpf, nomeResponsavel: dto.nomeResponsavel ?? null, tipo: dto.tipo ?? null, email: dto.email ?? null } as TelefoneCpfCache,
      ['telefone'],
    );

    this.logger.log(`Associação telefone→CPF gravada: ${telefone}`);
    return { ok: true, telefone, cpf };
  }

  async getCpfPorTelefone(telefone: string) {
    const tel = telefone.replace(/\D/g, '');
    const registro = await this.telefoneCpfRepo.findOne({ where: { telefone: tel } });
    if (!registro) throw new NotFoundException('Nenhum CPF associado a este número de telefone');
    return { telefone: registro.telefone, cpf: registro.cpf, nomeResponsavel: registro.nomeResponsavel, tipo: registro.tipo ?? null, email: registro.email ?? null };
  }
}
