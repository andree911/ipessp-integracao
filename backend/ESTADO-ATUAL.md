# IPESSP — Integração SophiA / n8n / Email

Documentação do estado atual do serviço `integracao-sophia-n8n`.  
Última atualização: Junho 2026.

---

## Visão geral

Serviço NestJS hospedado no **Render** que atua como hub central entre três sistemas:

```
SophiA (ERP escolar)
    │
    ├── lê alunos, responsáveis, lançamentos
    │
    └──► integracao-sophia-n8n  ──► E-mails automáticos (SMTP Office 365)
              │
              ├── cache SQLite (CPF → aluno/responsável)
              │
              └──► API REST  ◄── n8n (chatbot / automações)
                                  └── Supabase (avisos, calendário)
```

---

## O que é lido do SophiA

O `SophiaService` se autentica via usuário/senha e renova o token automaticamente em caso de 401.

| Endpoint SophiA | Dados retornados | Usado por |
|---|---|---|
| `GET /Alunos` | código, nome, CPF | Sync, Email |
| `GET /alunos/{id}/responsaveis` | nome, CPF, e-mail, responsavelFinanceiro | Sync, Email |
| `GET /alunos/{id}/Lancamentos` | vencimento, valor, boleto, PIX, recebido | Email, IA |
| `GET /alunos/{id}/Matriculas` | turma, série, unidade, situação | Disponível, não usado ativamente |

### Tipos de dados

```ts
AlunoApiModel          { codigo, nome, cpf?, email? }
ResponsavelAlunoApiModel { codigo, nome, cpf?, email?, responsavelFinanceiro, ... }
LancamentoAlunoApiModel  { codigo, descricao?, dataVencimento, recebido, valorPrevisto,
                           linhaDigitavel?, urlBoletoDigital?, codigoPix?, competencia? }
```

---

## O que é escrito no SophiA

| Endpoint SophiA | Quando é chamado |
|---|---|
| `POST /clientes` | Quando o n8n envia um prospecto captado via chatbot |

Campos enviados: `nome`, `cpf`, `interesse`, `observacao`, e lista de `contatos` (email/celular).

---

## Módulo de Sincronização (`/sync`)

**Objetivo:** manter um cache local (SQLite) de responsáveis financeiros indexados por CPF para consulta rápida sem bater no SophiA a cada request do chatbot.

### Funcionamento

1. Cron roda **todo hora** (`SYNC_CRON=0 * * * *`)
2. Busca todos os alunos via `getAllAlunos()` (paginação automática de 100 em 100)
3. Para cada aluno, busca os responsáveis e seleciona o **responsável financeiro** (ou o primeiro da lista)
4. Faz `upsert` na tabela `responsavel_cache` com chave composta `(cpf, codigoAluno)`

### Tabela `responsavel_cache` (SQLite)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Auto incremento |
| `cpf` | varchar | CPF do responsável (só números) |
| `codigoAluno` | int | Código do aluno no SophiA |
| `nomeAluno` | varchar | Nome do aluno |
| `codigoResponsavel` | int | Código do responsável no SophiA |
| `nomeResponsavel` | varchar | Nome do responsável |
| `email` | varchar? | E-mail do responsável |
| `atualizadoEm` | datetime | Atualizado automaticamente |

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/sync/trigger` | Dispara o sync manualmente (202 imediato) |
| `GET` | `/sync/status` | Retorna `{ responsaveisIndexados: N }` |

---

## Módulo de E-mail (`/email`)

### Fluxo de envio

```
[Cron 08h ou POST /email/trigger]
    │
    ├── getAllAlunos() → SophiA
    │
    └── Para cada aluno:
          ├── getResponsaveisAluno() → pega responsável financeiro + e-mail
          └── getLancamentosAluno() → filtra recebido === 0 (em aberto)
                │
                └── Para cada lançamento em aberto:
                      ├── Calcula diffDias = vencimento - hoje
                      ├── Determina tipo (lembrete / vencimento_hoje / cobranca)
                      ├── Verifica email_log → se já enviou hoje, pula
                      ├── Gera HTML do template
                      └── Envia via SMTP → salva no email_log
```

### Regras de disparo

| Tipo | Condição | Configuração |
|---|---|---|
| `lembrete` | 1 a N dias **antes** do vencimento | `EMAIL_DIAS_ANTES=3` |
| `vencimento_hoje` | Exatamente no dia do vencimento | Fixo |
| `cobranca` | N dias **após** o vencimento | `EMAIL_DIAS_APOS=1,3,7` |

Deduplicação: a combinação `(codigoLancamento + tipo)` não é reenviada no mesmo dia.

### Tabela `email_log` (SQLite)

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | int PK | Auto incremento |
| `codigoLancamento` | varchar | Código do lançamento no SophiA |
| `tipo` | varchar | `lembrete` / `vencimento_hoje` / `cobranca` |
| `destinatario` | varchar | E-mail do responsável |
| `enviado` | boolean | `true` = sucesso, `false` = erro |
| `erro` | varchar? | Mensagem de erro (quando falhou) |
| `enviadoEm` | datetime | Data/hora do envio |

### Templates de e-mail

Três templates com estrutura HTML idêntica, variando texto e assunto:

- **`templateLembrete`** → `[IPESSP] Sua mensalidade vence em X dia(s)`
- **`templateVencimentoHoje`** → `[IPESSP] Sua mensalidade vence HOJE`
- **`templateCobranca`** → `[IPESSP] Mensalidade em atraso — X dia(s)`

Estrutura do e-mail:

```
┌─────────────────────────────────────────┐
│  [Logo IPESSP]    TEL  (11) 99839-3640  │  ← Cabeçalho vermelho
│                   E-MAIL  matric...     │
├─────────────────────────────────────────┤
│  Olá, [Nome Responsável],               │  ← Saudação + texto dinâmico
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ Aluno: João da Silva             │   │  ← Card de resumo
│  │ Descrição: Mensalidade Jun/2026  │   │
│  │ Vencimento: 15/06/2026           │   │
│  │ ██ Total a pagar: R$ 850,00 ██   │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌── PIX ──────────────────────────┐    │  ← Card PIX (se disponível)
│  │  [QR Code]  Pix copia e cola    │    │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌── BOLETO ───────────────────────┐    │  ← Card Boleto (se disponível)
│  │  Linha digitável: 23793...      │    │
│  └─────────────────────────────────┘   │
│                                         │
│  [PIX AUTOMÁTICO]  [2ª VIA / PAGAR]    │  ← CTAs lado a lado
│                                         │
│  Aviso de segurança                     │
│  "sempre chegará pelo remetente         │
│   matricula.financeiro@ipessp.edu.br"   │
│                                         │
│  [VEJA COMO ACESSAR SUA FATURA]        │  ← CTA principal
├─────────────────────────────────────────┤
│  [Logo]  f  ig  yt  in                  │  ← Rodapé vermelho
│  © 2026 IPESSP · CNPJ · Endereço       │
└─────────────────────────────────────────┘
```

**Compatibilidade Outlook:** todo o layout usa `<table>`, `bgcolor` nos `<td>`, VML `<v:roundrect>` para botões arredondados, VML `<v:oval>` para círculos sociais, sem `rgba()` (substituído por cor sólida `#a40d26`), conditional comments `<!--[if mso]>` em todos os elementos críticos.

### Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/email/trigger` | Dispara o job manualmente (202 imediato) |
| `GET` | `/email/status` | `{ total, enviados, erros }` do email_log |
| `GET` | `/email/smtp/check` | Testa conexão SMTP — retorna `{ ok: true/false }` |

### Variáveis de ambiente relevantes

```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=matricula.financeiro@ipessp.edu.br
SMTP_PASS=...
SMTP_FROM=IPESSP <matricula.financeiro@ipessp.edu.br>

ESCOLA_NOME=IPESSP
ESCOLA_TELEFONE=(11) 99839-3640
EMAIL_LOGO_URL=https://...supabase.co/.../logo.png

EMAIL_CRON_HABILITADO=false   # true para ativar o envio automático diário
EMAIL_DIAS_ANTES=3            # dias antes do vencimento para lembrete
EMAIL_DIAS_APOS=1,3,7         # dias após o vencimento para cobrança
```

---

## Módulo IA / n8n (`/ia`)

API consumida pelo n8n para alimentar um assistente de atendimento (chatbot). Todas as rotas exigem `Authorization: Bearer <IA_BEARER_TOKEN>`.

### Endpoints

#### `GET /ia/financeiro?cpf=xxx`

Retorna pendências financeiras de um responsável a partir do CPF.

**Fluxo:**
1. Busca o CPF na tabela `responsavel_cache` (SQLite local — sem bater no SophiA)
2. Para cada aluno encontrado, chama `getLancamentosAluno()` no SophiA
3. Filtra apenas lançamentos em aberto (`recebido === 0`)

**Resposta:**
```json
[
  {
    "aluno": { "codigo": 123, "nome": "João da Silva" },
    "responsavel": { "codigo": 456, "nome": "Maria da Silva", "email": "..." },
    "pendencias": [
      {
        "codigo": 789,
        "descricao": "Mensalidade",
        "vencimento": "2026-06-15",
        "valor": 850.00,
        "linhaDigitavel": "23793...",
        "urlBoleto": "https://...",
        "pix": "00020126..."
      }
    ],
    "totalPendente": 850.00
  }
]
```

#### `GET /ia/avisos`

Retorna avisos ativos publicados pela escola, buscados na tabela `avisos` do Supabase.

```json
[{ "id": 1, "titulo": "...", "mensagem": "...", "criado_em": "..." }]
```

#### `GET /ia/calendario`

Retorna eventos futuros da escola, buscados na tabela `calendario` do Supabase.

```json
[{ "id": 1, "titulo": "...", "descricao": "...", "data_evento": "2026-07-10", "tipo": "..." }]
```

#### `POST /ia/prospectivo`

Cria um cliente/prospecto diretamente no SophiA. Usado quando o chatbot capta um lead.

**Body:**
```json
{
  "nome": "Carlos Souza",
  "cpf": "123.456.789-00",
  "email": "carlos@email.com",
  "telefone": "(11) 91234-5678",
  "interesse": "Curso técnico",
  "observacao": "Captado via WhatsApp"
}
```

---

## Supabase

Usado como banco de dados para conteúdo gerenciado pela escola (não transacional).

| Tabela | Conteúdo | Consumido por |
|---|---|---|
| `avisos` | Avisos ativos da escola (`ativo=true`) | `/ia/avisos` |
| `calendario` | Eventos futuros (`data_evento >= hoje`) | `/ia/calendario` |
| `assets/` (Storage) | Logo do IPESSP (`logo.png`) | Templates de e-mail |

---

## Infraestrutura

| Item | Detalhe |
|---|---|
| Plataforma | Render (plano Starter, região Ohio) |
| Runtime | Node.js v24 |
| Build | `npm install && npm run build` (NestJS → `dist/`) |
| Start | `node dist/main` |
| Banco de dados | SQLite (`better-sqlite3`) em disco persistente |
| Disco Render | `/opt/render/project/src/data/` — 1 GB |
| Health check | `GET /health` → `{ status: "ok" }` |

### Diagrama de módulos

```
AppModule
├── SophiaModule      → SophiaService (autenticação + chamadas à API)
├── SyncModule        → SyncService (cron horário → cache SQLite)
├── EmailModule       → EmailJobService (cron 08h → envio)
│                     → EmailService (transporte SMTP)
│                     → EmailController (/email/*)
└── IaModule          → IaService (consultas para o n8n)
                      → IaBearerGuard (autenticação Bearer)
                      → SupabaseService (avisos + calendário)
                      → IaController (/ia/*)
```

---

## Scripts de teste local

```bash
# Testar envio de e-mail real (usa .env)
npx ts-node scripts/test-email.ts destinatario@email.com

# Testar com inbox temporário (Ethereal, sem .env necessário)
npx ts-node scripts/test-email-ethereal.ts

# Testar com dados do SophiA real
npx ts-node scripts/test-email-sophia.ts
```

---

## Checklist de ativação em produção

- [x] Variáveis de ambiente configuradas no Render
- [x] `SOPHIA_USUARIO` e `SOPHIA_SENHA` corretos (`INTEGRACAO` / `ipessp@2026integracao`)
- [x] SMTP Office 365 funcionando (`matricula.financeiro@ipessp.edu.br`)
- [x] Logo hospedada no Supabase Storage (bucket `assets/logo.png`)
- [ ] **`EMAIL_CRON_HABILITADO=true`** — alterar quando pronto para envio real
- [ ] Redes sociais configuradas (`ESCOLA_INSTAGRAM`, `ESCOLA_FACEBOOK`, etc.) se houver
- [ ] CNPJ e endereço no rodapé (`ESCOLA_CNPJ`, `ESCOLA_ENDERECO`) se desejado
