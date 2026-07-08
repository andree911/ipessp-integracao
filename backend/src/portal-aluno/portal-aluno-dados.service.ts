import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { SophiaService } from '../sophia/sophia.service';
import { FinanceiroService } from '../financeiro/financeiro.service';

@Injectable()
export class PortalAlunoDadosService {
  constructor(
    private readonly sophia: SophiaService,
    private readonly financeiro: FinanceiroService,
    private readonly config: ConfigService,
  ) {}

  async meuFinanceiro(codigoSophia: number) {
    return this.financeiro.getByCodigoSophia(codigoSophia);
  }

  async meuCurso(codigoSophia: number) {
    const matriculas = await this.sophia.getMatriculasAluno(codigoSophia);
    return matriculas.map((m) => ({
      codigo: m.codigoMatricula,
      curso: m.nomeSerie ?? null,
      turma: m.nomeTurma ?? null,
      unidade: m.nomeUnidade ?? null,
      situacao: m.situacao ?? null,
      dataMatricula: m.dataMatricula ?? null,
    }));
  }

  async minhasNotas(idMatricula: number) {
    return this.sophia.getNotasAvaliacoes(idMatricula);
  }

  async minhaFrequencia(idMatricula: number) {
    return this.sophia.getFrequenciaCompleta(idMatricula);
  }

  async meuHorario(idMatricula: number) {
    return this.sophia.getHorarioDetalhado(idMatricula);
  }

  // Sophia não aceita arquivo direto (POST /clientes/{id}/Documentos só recebe
  // uma url pra download), então sobe primeiro pro Supabase Storage e manda a
  // URL pública. Mesmo padrão usado em CandidaturasService.uploadSupabase.
  // {id} assumido como o mesmo codigoSophia do aluno logado — não dá pra
  // confirmar isso só pelo swagger, revisar no primeiro teste real.
  async enviarDocumento(codigoSophia: number, descricao: string, file: Express.Multer.File) {
    const url = await this.uploadSupabase(file);
    const extensao = (file.originalname.split('.').pop() ?? '').toLowerCase();
    return this.sophia.postDocumentoCliente(codigoSophia, { descricao, url, extensao });
  }

  private async uploadSupabase(file: Express.Multer.File): Promise<string> {
    const url = this.config.get<string>('supabase.url');
    const key = this.config.get<string>('supabase.key');
    if (!url || !key) throw new Error('Supabase não configurado');

    const supabase = createClient(url, key);
    const path = `documentos/${Date.now()}_${file.originalname.replace(/\s/g, '_')}`;

    const { error } = await supabase.storage
      .from('portal-aluno')
      .upload(path, file.buffer, { contentType: file.mimetype, upsert: false });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from('portal-aluno').getPublicUrl(path);
    return data.publicUrl;
  }
}
