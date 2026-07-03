export interface AlunoApiModel {
  codigo: number;
  nome: string;
  cpf?: string;
  email?: string;
  codigoExterno?: string;
}

// Campos reais retornados por GET /alunos/{id}/responsaveis
export interface ResponsavelAlunoApiModel {
  codigo: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  responsavelFinanceiro: boolean;
  responsavelPedagogico: boolean;
  retiradaAutorizada?: boolean;
  codigoFamilia?: string;
}

// Campos reais retornados pelo item interno de GET /alunos/{id}/Matriculas
export interface MatriculaAlunoApiModel {
  codigoMatricula: number;
  turma?: number;
  nomeTurma?: string;
  codigoUnidade?: number;
  nomeUnidade?: string;
  nomeSerie?: string;
  situacao?: string;
  dataMatricula?: string;
}

// Wrapper externo retornado pelo endpoint (array de wrappers, cada um com lista interna)
export interface MatriculasWrapperApiModel {
  codigoAluno: number;
  matriculas: MatriculaAlunoApiModel[];
}

export interface AlunoDetalhadoApiModel {
  codigo: number;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  codigoExterno?: string;
  turmas?: Array<{ codigo: number; descricao: string }>;
  [key: string]: unknown;
}

export interface ColaboradorApiModel {
  codigo: number;
  nome: string;
  email?: string;
  emailCorporativo?: string;
  [key: string]: unknown;
}

export interface ListaChamadaItem {
  codigoLista: number;
  codigoTurma: number;
  disciplina: string;
  dataListaChamada: string;
  horaInicio: string;
  horaFinal: string;
  turma: string;
  status: string;
  [key: string]: unknown;
}

export interface AtaNotaItem {
  codigo: number;
  nomeAvaliacao: string;
  nomeResumidoAvaliacao: string;
  dataAvaliacao?: string;
  situacao: number;
  [key: string]: unknown;
}

export interface NotaAlunoItem {
  codigoMatricula: number;
  nota: string;
  nome: string;
}

// Campos reais retornados por GET /alunos/{id}/Lancamentos
export interface LancamentoAlunoApiModel {
  codigo: number;
  numeroLancamento?: number;
  descricao?: string;
  dataVencimento: string;        // ISO string
  dataPagamento?: string;        // preenchido quando pago
  recebido: number;              // 0 = em aberto, >0 = pago/recebido
  valorPrevisto: number;         // valor a pagar
  valorRecebido?: number;        // valor pago (quando recebido > 0)
  linhaDigitavel?: string;       // linha digitável do boleto
  codigoBoleto?: number;
  numeroBoleto?: number;
  boletoDisponivel?: boolean;
  urlBoletoDigital?: string;
  codigoPix?: string;
  responsavelFinanceiro?: string;
  titular?: string;
  competencia?: string;
}
