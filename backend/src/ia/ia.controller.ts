import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IaBearerGuard } from './ia.guard';
import { IaService } from './ia.service';
import { CriarProspectivoDto } from './dto/prospectivo.dto';
import { CriarResponsavelDto } from './dto/criar-responsavel.dto';
import { MatricularAlunoDto } from './dto/matricular-aluno.dto';
import { AssociarTelefoneDto } from './dto/associar-telefone.dto';

@Controller('ia')
@UseGuards(IaBearerGuard)
export class IaController {
  constructor(private readonly iaService: IaService) {}

  @Get('financeiro')
  getFinanceiro(@Query('cpf') cpf: string) {
    if (!cpf) throw new BadRequestException('Parâmetro cpf é obrigatório');
    return this.iaService.getFinanceiroByCpf(cpf);
  }

  @Get('boleto')
  getBoleto(@Query('cpf') cpf: string, @Query('codigoBoleto') codigoBoleto: string) {
    if (!cpf) throw new BadRequestException('Parâmetro cpf é obrigatório');
    if (!codigoBoleto) throw new BadRequestException('Parâmetro codigoBoleto é obrigatório');
    return this.iaService.getBoletoPdf(cpf, Number(codigoBoleto));
  }

  @Get('avisos')
  getAvisos() {
    return this.iaService.getAvisos();
  }

  @Get('calendario')
  getCalendario() {
    return this.iaService.getCalendario();
  }

  @Post('prospectivo')
  criarProspectivo(@Body() dto: CriarProspectivoDto) {
    return this.iaService.criarProspectivo(dto);
  }

  @Post('responsavel')
  criarResponsavel(@Body() dto: CriarResponsavelDto) {
    return this.iaService.criarResponsavel(dto);
  }

  @Post('matricula')
  matricularAluno(@Body() dto: MatricularAlunoDto) {
    return this.iaService.matricularAluno(dto);
  }

  @Post('associar-telefone')
  associarTelefoneCpf(@Body() dto: AssociarTelefoneDto) {
    return this.iaService.associarTelefoneCpf(dto);
  }

  @Get('cpf-por-telefone')
  getCpfPorTelefone(@Query('telefone') telefone: string) {
    if (!telefone) throw new BadRequestException('Parâmetro telefone é obrigatório');
    return this.iaService.getCpfPorTelefone(telefone);
  }

  @Get('secretaria')
  getSecretaria(@Query('cpf') cpf: string) {
    if (!cpf) throw new BadRequestException('Parâmetro cpf é obrigatório');
    return this.iaService.getSecretariaByCpf(cpf);
  }

  @Get('secretaria/professor')
  getProfessor(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Parâmetro email é obrigatório');
    return this.iaService.getProfessorByEmail(email);
  }

  @Get('secretaria/professor/alunos')
  getAlunosPorLista(@Query('idLista') idLista: string) {
    if (!idLista) throw new BadRequestException('Parâmetro idLista é obrigatório');
    return this.iaService.getAlunosPorLista(Number(idLista));
  }

  @Get('cursos')
  getCursos() {
    return this.iaService.getCursos();
  }

  @Get('turma-detalhada')
  getTurmaDetalhada(@Query('codigo') codigo: string) {
    if (!codigo) throw new BadRequestException('Parâmetro codigo é obrigatório');
    return this.iaService.getTurmaDetalhada(Number(codigo));
  }
}
