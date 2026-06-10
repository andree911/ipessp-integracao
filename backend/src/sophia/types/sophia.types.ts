export interface AlunoApiModel {
  codigo: number;
  nome: string;
  cpf?: string;
  email?: string;
  codigoExterno?: string;
}

export interface ResponsavelAlunoApiModel {
  codigo: number;
  nome: string;
  cpf?: string;
  rg?: string;
  email?: string;
  telefone?: string;
  celular?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  tipoResponsavel?: string; // F=financeiro, P=pedagógico
}

export interface MatriculaAlunoApiModel {
  codigo: number;
  codigoAluno: number;
  codigoTurma: number;
  codigoCurso: number;
  codigoUnidade: number;
  codigoPeriodoLetivo: number;
  situacao?: string;
  dataMatricula?: string;
}

export interface LancamentoAlunoApiModel {
  codigo: number;
  codigoAluno: number;
  codigoMatricula?: number;
  descricao?: string;
  valor: number;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  situacao: string; // A=aberto, P=pago, C=cancelado
  numeroDocumento?: string;
  nossoNumero?: string;
  codigoBarras?: string;
}

export interface SophiaPaginatedResponse<T> {
  data: T[];
  totalRegistros?: number;
  pagina?: number;
  tamanhoPagina?: number;
}
