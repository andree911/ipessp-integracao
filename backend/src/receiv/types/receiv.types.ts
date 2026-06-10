// ─── Auth ────────────────────────────────────────────────────────────────────

export interface RecivJwtPayload {
  iss: string;   // jwt_iss fornecido pela Receiv
  ist: string;   // jwt_ist fornecido pela Receiv
  iat: number;
  exp: number;
  jti: string;
}

// ─── Clientes ────────────────────────────────────────────────────────────────

export interface RecivCliente {
  codigo_do_credor: number;      // código do credor (escola) na Receiv
  codigo_cliente: number | string; // ID do responsável no SophiA
  nome_do_cliente: string;
  cpf_ou_cnpj?: string;
  rg?: string;
  e_mail?: string;
  celular?: number | string;
  telefone?: number | string;
  logradouro?: string;
  numero_no_logradouro?: string | number;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  data_de_nascimento?: string;   // DD/MM/YYYY
}

// ─── Contratos ───────────────────────────────────────────────────────────────

export interface RecivContrato {
  codigo_do_credor: number;
  numero_do_contrato: string;    // ID da matrícula no SophiA (como string)
  cpf_ou_cnpj?: string;
  codigo_cliente: number | string;
  descricao?: string;
  data_inicial_contrato?: string; // DD/MM/YYYY
  situacao_do_contrato?: number;  // 1 = ativo
  valor_principal?: number;
  parcelamento?: number;
}

// ─── Títulos ─────────────────────────────────────────────────────────────────

export interface RecivTitulo {
  codigo_do_credor: number;
  codigo_cliente: number | string;
  cpf_ou_cnpj?: string;
  titulo: number;                // código do lançamento no SophiA (numérico)
  codigo_do_titulo?: number;
  numero_do_contrato?: string;   // ID da matrícula
  descricao_servico?: string;
  data_do_titulo?: string;       // DD/MM/YYYY
  vencimento_original?: string;  // DD/MM/YYYY
  vencimento_do_titulo: string;  // DD/MM/YYYY
  valor_do_titulo: number;
  valor_bruto?: number;
  situacao?: number;             // 1 = em aberto
  linha_digitavel_boleto?: string;
}

// ─── Baixas ──────────────────────────────────────────────────────────────────

export interface RecivBaixa {
  codigo_do_credor: number;
  codigo_cliente: number | string;
  cpf_ou_cnpj?: string;
  titulo: number | string;       // código do lançamento
  vencimento_do_titulo?: string; // DD/MM/YYYY
  data_pagamento: string;        // DD/MM/YYYY
  valor_pago: number;
  numero_do_contrato?: string;
}

// ─── Webhooks recebidos da Receiv ────────────────────────────────────────────

export interface RecivWebhookAcordo {
  evento: 'acordo_efetivado' | 'acordo_quebrado';
  integ_id_cliente: string;
  integ_ids_titulos: string[];
  valor_total: number;
  data_acordo: string;
  parcelas?: Array<{ vencimento: string; valor: number }>;
}

export interface RecivWebhookPagamento {
  evento: 'pagamento_registrado';
  integ_id_titulo: string;
  valor_pago: number;
  data_pagamento: string;
}

export interface RecivWebhookNegativacao {
  evento: 'negativacao_realizada' | 'negativacao_cancelada';
  integ_id_cliente: string;
  integ_ids_titulos: string[];
  data_evento: string;
}
