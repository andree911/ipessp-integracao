# Backend — Integração Sophia × n8n (IPESSP)

Backend NestJS que serve como camada intermediária entre o bot de atendimento WhatsApp (n8n), o ERP SophiA e o banco Supabase. Também compartilha o banco com o projeto `ipessp-corporativo`.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript) |
| Banco | Supabase PostgreSQL (compartilhado com `ipessp-corporativo`) |
| ORM | TypeORM (`synchronize: true`) |
| ERP | SophiA REST API |
| Mensageria | Z-API (WhatsApp) |
| Automação | n8n |
| Deploy | Render (free tier — dorme por inatividade) |

---

## Arquitetura geral

```
WhatsApp (usuário)
    │
    ▼
Z-API ──► n8n Bot Flow (AI Agent + Tools)
                │
                ▼
        NestJS Backend (Render)
        ├── /ia/*          → Dados do aluno/professor (Sophia + Supabase)
        ├── /v1/ti/*       → Abertura e consulta de chamados (Supabase)
        ├── /v1/admin/*    → Endpoints administrativos / debug
        └── /health        → Keep-alive ping (evita sleep do Render)

Supabase DB Webhook → n8n Notificação → Z-API → WhatsApp (solicitante)
```

---

## Autenticação

Todos os endpoints do bot usam **Bearer Token** fixo validado pelo `IaBearerGuard`:

```
Authorization: Bearer d381c324adfc9ce74e195fcb7dc024e99b7e8bcf91d4bc86aa26f7c89c368a1c
```

---

## Módulos e endpoints

### `/ia` — Integração IA / Bot

#### `GET /ia/cpf-por-telefone?telefone=`
Retorna CPF, nome, tipo (`aluno` | `professor` | `funcionario`) e e-mail associados ao telefone.  
Usado pelo bot para injetar contexto do usuário logo no início da conversa.

#### `POST /ia/associar-telefone`
Grava ou atualiza a associação telefone → CPF na tabela `telefone_cpf_cache`.

```json
{
  "telefone": "11999999999",
  "cpf": "12345678900",
  "nomeResponsavel": "João Silva",
  "tipo": "aluno",
  "email": "ra12345@fipessp.edu.br"
}
```

#### `GET /ia/financeiro?cpf=`
Retorna pendências financeiras do aluno via cache local (`responsavel_cache` + `lancamento_cache`).

#### `GET /ia/secretaria?cpf=`
Retorna matrículas ativas do aluno consultando o SophiA (`getMatriculasAluno`).

#### `GET /ia/secretaria/professor?email=`
Busca o professor no SophiA via e-mail (`getColaboradores`), retorna cronograma das próximas 20 aulas e lista de turmas.

#### `GET /ia/secretaria/professor/alunos?idLista=`
Retorna os alunos de uma lista de chamada específica (`getAlunosListaChamada`).

#### `GET /ia/avisos`
Avisos ativos da tabela `avisos` no Supabase.

#### `GET /ia/calendario`
Eventos futuros da tabela `calendario` no Supabase.

---

### `/v1/ti` — Chamados de TI

Mapeia para a tabela `chamados` existente no Supabase (compartilhada com `ipessp-corporativo`).

#### `POST /v1/ti/chamados`
Abre um chamado. O campo `criado_por_email` é sempre `bot@ipessp.edu.br`.  
Retorna referência no formato `CH-XXXXXXXX`.

```json
{
  "titulo": "Não consigo acessar o Teams",
  "descricao": "Erro de senha ao tentar entrar na aula",
  "categoria": "Acesso",
  "prioridade": "media",
  "telefoneSolicitante": "11999999999",
  "criadoPorNome": "João Silva",
  "setor": "Aluno"
}
```

Categorias válidas: `Hardware` | `Software` | `Acesso` | `Rede` | `Email` | `Outro`  
Prioridades válidas: `baixa` | `media` | `alta` | `urgente`

#### `GET /v1/ti/chamados?telefone=`
Lista os últimos 5 chamados do número informado.

---

### `/v1/admin` — Administração

Endpoints de debug/administração protegidos por API Key separada.

#### `GET /v1/admin/financeiro/buscar?cpf=`
Consulta cache financeiro por CPF (debug).

---

### `/health`
Endpoint público para keep-alive. Retorna `{ ok: true }`.  
O fluxo n8n **Keep-alive backend** faz GET neste endpoint a cada 10 minutos para evitar que o Render coloque o serviço para dormir.

---

## Entidades TypeORM (banco compartilhado Supabase)

| Entidade | Tabela | Descrição |
|---|---|---|
| `TelefoneCpfCache` | `telefone_cpf_cache` | Associação telefone → CPF + tipo + e-mail |
| `ResponsavelCache` | `responsavel_cache` | Cache aluno/responsável para financeiro |
| `ClienteCache` | (financeiro) | Cache de clientes SophiA |
| `LancamentoCache` | (financeiro) | Cache de lançamentos financeiros |
| `Chamado` | `chamados` | Chamados de TI (compartilhado com corporativo) |
| `EmailLog` | `email_log` | Log de e-mails enviados |
| `Lead` / `LeadHistorico` | `leads` | CRM de leads |
| `Candidatura` | `candidaturas` | Candidaturas de vagas |
| `Usuario` / `Professor` | `usuarios` / `professores` | Auth do corporativo |

> **Atenção:** TypeORM com `synchronize: true`. Colunas `nullable: true` em PostgreSQL exigem `type: 'text'` explícito no decorator `@Column`, caso contrário ocorre `DataTypeNotSupportedError`.

---

## Integração SophiA ERP

O `SophiaService` encapsula todas as chamadas HTTP ao ERP:

| Método | Uso |
|---|---|
| `getMatriculasAluno(codigoAluno)` | Matrículas do aluno (secretaria) |
| `getColaboradores({ Email })` | Busca professor por e-mail |
| `getListaChamadaProfessor(codigoProfessor)` | Cronograma + turmas do professor |
| `getAlunosListaChamada(idLista)` | Alunos de uma aula específica |
| `criarCliente(dto)` | Cadastro de prospecto |
| `criarResponsavelAluno(...)` | Vínculo responsável ↔ aluno |
| `matricularAluno(...)` | Matrícula no SophiA |

---

## Identificação de usuário no bot

O campo `telefone_cpf_cache.tipo` determina o fluxo no n8n:

| Tipo | Fluxo disponível |
|---|---|
| `aluno` | Financeiro, Secretaria, TI |
| `professor` | Cronograma, Turmas, TI |
| `funcionario` | TI (+ demais conforme configuração) |
| (não cadastrado) | Bot solicita CPF e cadastra |

E-mail institucional padrão de aluno: `ra[RA]@fipessp.edu.br`

---

## Notificação de chamados TI (webhook Supabase)

Quando o status de um chamado muda no Supabase, um **Database Webhook** dispara o fluxo n8n **Notificação Chamado TI**:

```
Supabase Webhook (UPDATE em chamados)
    │
    ▼
n8n: Validar Notificação
    │  ✓ telefone_solicitante existe
    │  ✓ status mudou (old_record ≠ record)
    ▼
Gerar Mensagem (Code node)
    │  Mapeia status → mensagem WhatsApp
    ▼
Enviar WhatsApp via Z-API
```

Mensagens geradas por status:
- `em_andamento` → "Sua equipe de TI já está trabalhando nisso"
- `aguardando` → "O TI precisa de mais informações — contato: wa.me/NUMERO_TI"
- `resolvido` → "Chamado resolvido" + campo `resolucao`
- `fechado` → "Chamado encerrado" + campo `resolucao`

---

## Fluxos n8n em `docs/`

| Arquivo | Descrição |
|---|---|
| `Keep-alive-backend.json` | Ping a `/health` a cada 10 min (evita sleep do Render) |
| `Notificação-chamado-TI.json` | Notifica solicitante via WhatsApp quando chamado muda de status |
| `CRM-IPESSP-Leads-completo.json` | Fluxo de CRM / leads |
| `n8n-nutricao-whatsapp.json` | Fluxo de nutrição via WhatsApp |

---

## Credenciais relevantes (variáveis de ambiente)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SOPHIA_BASE_URL` | URL base do ERP SophiA |
| `SOPHIA_TOKEN` | Token de autenticação SophiA |
| `SUPABASE_URL` | URL do projeto Supabase |
| `SUPABASE_KEY` | Chave anon/service do Supabase |
| `IA_BEARER_TOKEN` | Token Bearer dos endpoints do bot |

---

## Deploy (Render)

- Free tier: dorme após ~15 min de inatividade
- Solução: fluxo n8n Keep-alive faz GET `/health` a cada 10 min enquanto ativo
- Para produção real: considerar upgrade para paid tier ou migrar para Railway/Fly.io
