# Backend — Integração Sophia × n8n (IPESSP)

Backend NestJS que serve como camada intermediária entre o frontend institucional deste projeto (Next.js, nunca publicado — o site institucional real, `ipessp.edu.br`, é outro projeto), o bot de atendimento WhatsApp (n8n), o ERP SophiA e o banco Supabase. Também compartilha o banco com o projeto `ipessp-corporativo`.

IPESSP = Instituto de Pesquisa e Educação em Saúde de São Paulo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript) |
| Banco | Supabase PostgreSQL (compartilhado com `ipessp-corporativo`) |
| ORM | TypeORM (`synchronize: true`) |
| ERP | SophiA REST API |
| Mensageria | Z-API (WhatsApp) |
| E-mail | SMTP (Nodemailer) |
| Automação | n8n |
| Deploy | VPS própria (Docker Compose), atrás de Caddy — ver seção "Deploy" |

---

## Arquitetura geral

```
Frontend Next.js deste projeto (não publicado)
  └── Formulários (contato, manifestação, evento, candidatura) → /v1/*

WhatsApp (usuário) ──► Z-API ──► n8n Bot Flow (AI Agent + Tools)
                                       │
                                       ▼
                               NestJS Backend (VPS, Docker Compose)
                               ├── /ia/*          → Dados do aluno/professor (Sophia + Supabase)
                               ├── /v1/ti/*       → Abertura e consulta de chamados (Supabase)
                               ├── /v1/admin/*    → Endpoints administrativos / debug
                               └── /health        → Health check

SophiaService (cron horário) ──► Sync ──► cache local (clientes_cache / lancamentos_cache)
                                                │
                                                ▼
                          Jobs de cobrança (e-mail + WhatsApp) leem o cache e notificam alunos

Supabase DB Webhook → n8n Notificação → Z-API → WhatsApp (solicitante de chamado de TI)
```

---

## Autenticação

| Guard | Onde é usado | Como |
|---|---|---|
| `IaBearerGuard` | `/ia/*`, `/v1/ti/*` | Bearer token fixo (`IA_BEARER_TOKEN`) |
| `AdminApiKeyGuard` | `/v1/admin/*` | API key separada (`ADMIN_API_KEY`) |
| Sem guard (público, com rate limit) | `/v1/candidaturas`, `/v1/mensagens-contato`, `/v1/manifestacoes`, `/v1/solicitacoes-eventos` | `ThrottlerGuard` do NestJS limita abuso |

```
Authorization: Bearer <IA_BEARER_TOKEN>
```

---

## Módulos e endpoints

### `/ia` — Integração IA / Bot (WhatsApp)

#### `GET /ia/cpf-por-telefone?telefone=`
Retorna CPF, nome, tipo (`aluno` | `professor` | `funcionario`) e e-mail associados ao telefone. Usado pelo bot para injetar contexto do usuário logo no início da conversa.

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
Retorna pendências financeiras do aluno via cache local (`clientes_cache` + `lancamentos_cache`), incluindo `linhaDigitavel`, `urlBoleto`, `pix` (código copia-e-cola) e `codigoBoleto` (necessário para baixar o PDF via `/ia/boleto`).

#### `GET /ia/boleto?cpf=&codigoBoleto=`
Baixa o PDF do boleto direto do Sophia (`GET /alunos/{idAluno}/Boletos/{codigoBoleto}`) e devolve em base64 (`{ base64, fileName, mimeType }`), pronto para o node de envio de documento da Z-API anexar na conversa do WhatsApp sem precisar de URL pública. Valida que o `codigoBoleto` pertence a um lançamento de um cliente com aquele CPF antes de liberar.

#### `POST /ia/boleto/enviar`
Mesma validação do endpoint acima, mas já manda o PDF direto pro WhatsApp do número informado via Z-API (`WhatsAppService.enviarDocumento`), em vez de devolver o base64 pra quem chamou. É essa a rota que a tool "Enviar Boleto PDF" do bot usa quando o aluno pede o boleto em arquivo (não só linha digitável/PIX).

```json
{ "cpf": "12345678900", "codigoBoleto": 123, "telefone": "11999999999" }
```

#### `GET /ia/secretaria?cpf=`
Retorna matrículas ativas do aluno consultando o SophiA (`getMatriculasAluno`).

#### `GET /ia/secretaria/professor?email=`
Busca o professor no SophiA via e-mail (`getColaboradores`), retorna cronograma das próximas 20 aulas e lista de turmas.

#### `GET /ia/secretaria/professor/alunos?idLista=`
Retorna os alunos de uma lista de chamada específica (`getAlunosListaChamada`).

#### `GET /ia/cursos`
Lista os cursos cadastrados no Sophia (`GET /Cursos`) — usado para montar o payload de matrícula com valores de catálogo corretos.

#### `GET /ia/turma-detalhada?codigo=`
Detalhe de uma turma do Sophia (`GET /Turmas/detalhada/{codigoTurma}`).

#### `GET /ia/avisos`
Avisos ativos da tabela `avisos` no Supabase.

#### `GET /ia/calendario`
Eventos futuros da tabela `calendario` no Supabase.

---

### `/v1/candidaturas` — Vagas / trabalhe conosco

#### `POST /v1/candidaturas` (multipart, campo `file`)
Recebe candidatura a vaga (monitoria, docência, laboratório, administrativo, outro) com currículo em PDF/Word (máx. 2 MB). Sobe o arquivo pro Supabase Storage (bucket `candidaturas`) e notifica por e-mail (`ESCOLA_EMAIL_NOTIFICACOES`), com o currículo anexado.

---

### `/v1` — Formulários institucionais do site

| Endpoint | Descrição |
|---|---|
| `POST /v1/mensagens-contato` | Formulário de "fale conosco" |
| `POST /v1/manifestacoes` | Ouvidoria / manifestações |
| `POST /v1/solicitacoes-eventos` | Solicitação de espaço/evento |

Todos com `ThrottlerGuard` (5 requisições/min) por serem públicos.

---

### `/v1/ti` — Chamados de TI

Mapeia para a tabela `chamados` existente no Supabase (compartilhada com `ipessp-corporativo`).

#### `POST /v1/ti/chamados`
Abre um chamado. O campo `criado_por_email` é sempre `bot@ipessp.edu.br`. Retorna referência no formato `CH-XXXXXXXX`.

Categorias válidas: `Hardware` | `Software` | `Acesso` | `Rede` | `Email` | `Outro`
Prioridades válidas: `baixa` | `media` | `alta` | `urgente`

#### `GET /v1/ti/chamados?telefone=`
Lista os últimos 5 chamados do número informado.

---

### `/v1/admin` — Administração

Protegido por `AdminApiKeyGuard` + `ThrottlerGuard` (30 req/min).

| Endpoint | Descrição |
|---|---|
| `GET /v1/admin/financeiro/stats` | Totais de clientes/lançamentos em cache |
| `GET /v1/admin/financeiro/buscar?cpf=` | Consulta cache financeiro por CPF (debug) |
| `GET /v1/admin/email/status` | Se o cron de e-mails de cobrança está habilitado |
| `POST /v1/admin/email/toggle` | Liga/desliga o cron de e-mails |
| `POST /v1/admin/email/disparar` | Dispara o job de e-mails manualmente |
| `GET /v1/admin/cancelamento/buscar-aluno?q=` | Busca aluno por nome/RA no cache local (autocomplete da tela de Cancelamentos) |
| `GET /v1/admin/cancelamento/financeiro?ra=` | Resumo financeiro pra cancelamento (multa, saldo devedor) |
| `POST /v1/admin/cancelamento/email` | Envia e-mail de cancelamento (acadêmico/financeiro) |
| `GET /v1/admin/sophia/buscar-por-nome?nome=` | Busca aluno direto na Sophia por nome — devolve `codigo` (o que os 3 endpoints abaixo esperam) ao lado de `codigoExterno` (RA) |
| `GET /v1/admin/sophia/matriculas?aluno=` | Matrículas de um aluno (usa `codigo`, não RA) |
| `GET /v1/admin/sophia/notas?matricula=` | Notas/avaliações de uma matrícula — endpoint não documentado de forma confiável no swagger da Sophia |
| `GET /v1/admin/sophia/horario?matricula=` | Quadro de horários de uma matrícula — idem, não documentado no swagger |
| `GET /v1/admin/whatsapp/status` | Diagnóstico: se o cron de WhatsApp está habilitado e se as credenciais Z-API estão configuradas (só booleanos, nunca os valores) |

---

### `/email` — Testes e status de e-mail transacional

Sem guard dedicado (uso interno/debug). Endpoints de `test/*` mandam e-mails de exemplo (lembrete de mensalidade, dados reais de um aluno por CPF/lançamento) para validar o template e a conexão SMTP — não usar em produção sem restringir acesso.

| Endpoint | Descrição |
|---|---|
| `POST /email/trigger` | Dispara o job de cobrança por e-mail manualmente |
| `GET /email/status` | Totais de `email_log` (enviados/erros) |
| `GET /email/smtp/check` | Testa a conexão SMTP |
| `POST /email/test`, `test/sophia`, `test/cpf`, `test/lancamento` | Envios de teste do template de lembrete |

Jobs de cobrança automatizados (cron, controlados por `EMAIL_CRON_HABILITADO` / `WPP_CRON_HABILITADO`):
- `email-job.service.ts` — lembretes de vencimento e avisos de atraso por e-mail, nos dias configurados em `EMAIL_DIAS_ANTES` / `EMAIL_DIAS_APOS`.
- `whatsapp-job.service.ts` — mesma lógica, mas via WhatsApp (Z-API), dias configurados em `WPP_DIAS_ANTES` / `WPP_DIAS_APOS`.

---

### `/sync` — Sincronização Sophia → cache local

#### `POST /sync/trigger`
Dispara manualmente o ciclo de sincronização (também roda sozinho via `@Cron('0 * * * *')`).

#### `GET /sync/status`
Indica se um ciclo de sync está rodando no momento.

O ciclo (`SyncService.runSync`) busca todos os alunos do Sophia, para cada um busca responsável financeiro e lançamentos, e grava em `clientes_cache` / `lancamentos_cache`.

---

### `/` — Diversos

#### `GET /health`
Endpoint público de health check. Retorna `{ status: 'ok' }`. O fluxo n8n **Keep-alive backend** que fazia GET aqui a cada 10 minutos (herança da época do Render, pra evitar cold start) não existe mais no n8n da VPS atual — removido em 2026-08-02 junto com o `docs/Keep-alive-backend.json`, já que o serviço na VPS não dorme e o ping não tinha mais efeito prático. Endpoint continua existindo, só não tem mais nada chamando ele periodicamente.

#### `GET /como-pagar`
Página HTML estática (sem dependência de banco) explicando ao aluno como pagar a mensalidade pelo Portal do Aluno Sophia — usada como link em e-mails/WhatsApp de cobrança.

---

## Matrícula + pagamento — nota histórica

Este backend já teve um fluxo completo de matrícula pelo site (`/v1/matriculas` + `/v1/pagamentos/mp-webhook`): Mercado Pago cobrava a 1ª parcela, o webhook aprovado chamava `POST /clientes` automaticamente no Sophia, e o financeiro era notificado (e-mail + WhatsApp) para efetivar a matrícula manualmente — porque a API pública do Sophia não expõe conversão de Cliente em Aluno nem criação de plano de pagamento customizado (isso é feito só manualmente, dentro do Sophia).

O site que alimentava esse fluxo (`site-ipessp-frontend`) nunca foi ao ar em produção — o domínio real (`ipessp.edu.br`) é outro projeto. O fluxo, o Mercado Pago e a notificação manual de cadastro no Sophia foram removidos em 2026-08-11; a automação Cliente→Aluno segue como algo a ser revisitado (ver `ipessp-sistema/core`, que hoje é o caminho ativo de matrícula/pagamento).

---

## Entidades TypeORM (banco compartilhado Supabase)

| Entidade | Tabela | Descrição |
|---|---|---|
| `TelefoneCpfCache` | `telefone_cpf_cache` | Associação telefone → CPF + tipo + e-mail |
| `ClienteCache` | `clientes_cache` | Cache de clientes/alunos do Sophia (`codigoSophia` = `idAluno`) |
| `LancamentoCache` | `lancamentos_cache` | Cache de lançamentos financeiros, incluindo `linhaDigitavel`, `codigoPix`, `codigoBoleto`, `urlBoleto` |
| `ResponsavelCache` | `responsavel_cache` | Cache do responsável financeiro vinculado a cada aluno por CPF — alimentado pelo `SyncService`, lido por `GET /ia/secretaria` |
| `Chamado` | `chamados` | Chamados de TI (compartilhado com corporativo) |
| `EmailLog` | `email_log` | Log de e-mails enviados |
| `Candidatura` | `candidatura` | Candidaturas de vagas |
| `Manifestacao`, `MensagemContato`, `SolicitacaoEvento` | `manifestacao`, `mensagem_contato`, `solicitacao_evento` | Formulários institucionais do site |

> **Atenção:** TypeORM com `synchronize: true`. Colunas `nullable: true` em PostgreSQL exigem `type` explícito no decorator `@Column` (ex.: `'varchar'`, `'integer'`), caso contrário ocorre `DataTypeNotSupportedError`.

---

## Integração SophiA ERP

O `SophiaService` encapsula todas as chamadas HTTP ao ERP:

| Método | Uso |
|---|---|
| `getAllAlunos` / `getAlunos` | Lista de alunos (usado pelo sync) |
| `getAlunoById` / `searchAlunoByEmail` | Busca aluno por id/e-mail |
| `getResponsaveisAluno` | Responsáveis de um aluno |
| `getMatriculasAluno` | Matrículas do aluno (secretaria) |
| `getLancamentosAluno` | Lançamentos financeiros do aluno |
| `getBoleto(idAluno, codigoBoleto)` | Baixa o PDF do boleto (base64 → Buffer) |
| `getColaboradores` | Busca professor por e-mail/nome |
| `getListaChamadaProfessor` / `getAlunosListaChamada` | Cronograma + turmas do professor / alunos de uma aula |
| `getCursos` / `getTurmaDetalhada` | Catálogo de cursos/turmas (usar para montar payload de matrícula com valores corretos) |

Documentação bruta da API (Swagger 2.0 exportado) em `documentacao/swagger.json`. Documentação da API do Bolecode/Itaú (collection Postman, **não é do Sophia**) em `documentacao/Bolecode_new 3.json` — mantida só como referência, não integrar direto (ver seção acima).

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

## Fluxos n8n em `docs/`

| Arquivo | Descrição |
|---|---|
| `Bot-IPESSP-WhatsApp.roteado.json` | Bot de atendimento (AI Agent) — financeiro, secretaria, TI, cursos, captura de lead e envio de boleto em PDF. Confirmado idêntico ao workflow inativo "Bot IPESSP WhatsApp (Roteado)" no n8n (2026-08-02) |
| `Bot-IPESSP-WhatsApp.encaminhar-leads.json` | Variante do bot que roda ativa no n8n hoje ("Bot IPESSP WhatsApp (Encaminhar Leads)") |

O CRM de leads (notificação de novo lead, nutrição automática, relatórios diário/semanal e reativação de leads pausados) roda como fluxo n8n próprio, versionado no repositório `ipessp-core` — não existe cópia dele aqui em `docs/`. As tools de CRM do bot acima (`Verificar Lead CRM`, `Registrar Lead CRM`, `Registrar Interação Bot`) chamam esse outro backend via `IPESSP_CORE_URL` (ver `n8n.env.example`).

`Keep-alive-backend.json` e `Notificação-chamado-TI.json` eram citados aqui mas não existem em nenhum workflow do n8n atualmente (removidos ou nunca importados na VPS atual) — os arquivos foram removidos de `docs/` em 2026-08-02.

Os fluxos acima usam `$env.NOME` (n8n auto-hospedado na mesma VPS via Docker Compose — variáveis reais configuradas em `n8n-vars.env`, não pela feature paga "Variables" do n8n Cloud).

---

## Credenciais relevantes (variáveis de ambiente)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SOPHIA_BASE_URL`, `SOPHIA_USUARIO`, `SOPHIA_SENHA`, `SOPHIA_TENANT` | Credenciais do ERP SophiA |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Projeto Supabase (dados + storage de currículos) |
| `IA_BEARER_TOKEN` | Token Bearer de `/ia/*` e `/v1/ti/*` |
| `ADMIN_API_KEY` | Chave dos endpoints `/v1/admin/*` |
| `JWT_SECRET` | Obrigatório — sem ele a aplicação não sobe |
| `WEBHOOK_SECRET` | (reservado para webhooks internos) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Envio de e-mail transacional |
| `EMAIL_CRON_HABILITADO`, `EMAIL_DIAS_ANTES`, `EMAIL_DIAS_APOS`, `EMAIL_LOGO_URL`, `EMAIL_PORTAL_ALUNO_URL` | Job de cobrança por e-mail |
| `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `ZAPI_TELEFONE_FINANCEIRO` | Envio de WhatsApp (Z-API) |
| `WPP_CRON_HABILITADO`, `WPP_DIAS_ANTES`, `WPP_DIAS_APOS` | Job de cobrança por WhatsApp |
| `ESCOLA_NOME`, `ESCOLA_TELEFONE`, `ESCOLA_SITE`, `ESCOLA_CNPJ`, `ESCOLA_ENDERECO`, `ESCOLA_EMAIL_NOTIFICACOES`, `ESCOLA_INSTAGRAM`, `ESCOLA_FACEBOOK`, `ESCOLA_YOUTUBE`, `ESCOLA_LINKEDIN` | Dados institucionais usados em e-mails/templates |
| `BACKEND_URL`, `SITE_URL` | URLs usadas em callbacks/links gerados |
| `SYNC_CRON`, `SYNC_LOOKBACK_DAYS` | Configuração do cron de sincronização Sophia → cache |

---

## Deploy (VPS, Docker Compose)

Migrado do Render (free tier, que dormia por inatividade) para uma VPS
própria (Hostinger). Roda via Docker Compose ao lado do n8n e do Caddy
(proxy reverso/TLS), tudo em `/opt/ipessp/` no servidor:

- `docker-compose.yml` — define os serviços `caddy`, `n8n`, `n8n-postgres` e
  `integracao-service` (este último faz `build` a partir da pasta
  `./integracao-service`).
- `Caddyfile` — roteia `srv1835634.hstgr.cloud/n8n/*` pro n8n e o resto
  (`/health`, `/v1/*`, `/ia/*`, `/portal/*` etc.) pro `integracao-service`.
- `integracao-service/` no servidor **não é um clone git** — é só a árvore de
  arquivos (o `.env` real fica em `/opt/ipessp/integracao.env`, referenciado
  pelo `docker-compose.yml`, fora da pasta do serviço).

**Deploy de uma mudança nova:**
```bash
# 1. Local: empacota o HEAD do repo (só arquivos versionados) e manda pro servidor
git archive HEAD | ssh -i ~/.ssh/id_ed25519_ipessp root@179.197.237.177 \
  "rm -rf /tmp/integracao-deploy && mkdir -p /tmp/integracao-deploy && tar -x -C /tmp/integracao-deploy"

# 2. Servidor: sincroniza por cima da pasta viva SEM --delete
#    (preserva node_modules, .env, data/*.db, .claude/ que não estão no git)
ssh -i ~/.ssh/id_ed25519_ipessp root@179.197.237.177 \
  "rsync -a /tmp/integracao-deploy/ /opt/ipessp/integracao-service/ && rm -rf /tmp/integracao-deploy"

# 3. Servidor: rebuild + restart só do serviço afetado
ssh -i ~/.ssh/id_ed25519_ipessp root@179.197.237.177 \
  "cd /opt/ipessp && docker compose build integracao-service && docker compose up -d integracao-service"
```

**Verificação pós-deploy:**
- `docker logs ipessp-integracao-service-1 --tail 60` — confirmar "Nest
  application successfully started" sem erro.
- `curl -s -o /dev/null -w '%{http_code}\n' https://srv1835634.hstgr.cloud/health`
  deve devolver `200`.

---

## Pendência: webhook da Z-API não chega no backend (cobrança WhatsApp)

**Status (2026-08-18): não aplicado — VPS fora do ar, aplicar assim que voltar.**

Achado ao revisar a integração de cobrança por WhatsApp: o painel da Z-API está
configurado com `https://srv1835634.hstgr.cloud/n8n/webhook/930c3dd4-8cd0-4d66-a615-e2a959fedaf8`
(webhook do fluxo n8n "Bot IPESSP WhatsApp (Encaminhar Leads)"). Como o
Caddyfile roteia **todo** `/n8n/*` pro container do n8n (ver diagrama acima),
essa mensagem nunca chega no `WhatsAppWebhookController` (`POST
/whatsapp/webhook`, criado no commit `47039c7`, 2026-08-14) — ou seja, hoje as
respostas às opções de cobrança (`ja_paguei`/`ajuda`/`portal`/`pagar_whatsapp`)
não são processadas pelo backend, só o repasse de lead continua funcionando
(por acaso, já que o n8n recebe direto).

O código do backend (`WhatsAppWebhookController` + `N8N_WHATSAPP_WEBHOOK_URL`)
já está pronto e correto — o `repasse` pro n8n usa a rede interna do Docker
(`http://n8n:5678/webhook/930c3dd4-...`), que não passa pelo Caddy, então dá
pra fechar o fluxo sem loop só com uma exceção no Caddyfile. **Não precisa
mudar nada no painel da Z-API.**

```
Z-API ──(externo, via Caddy)──► /n8n/webhook/930c3dd4-...
                                         │
                          Caddy: exceção pontual, redireciona pro backend
                                         ▼
                          integracao-service /whatsapp/webhook
                          ├─ opção de cobrança → responde 100% aqui
                          └─ resto (lead) ──(interno, sem Caddy)──► n8n:5678/webhook/930c3dd4-...
```

**Aplicar quando a VPS voltar** (`/opt/ipessp/Caddyfile`, ANTES do bloco
existente `handle /n8n/* { reverse_proxy n8n:5678 }`):
```caddyfile
handle /n8n/webhook/930c3dd4-8cd0-4d66-a615-e2a959fedaf8 {
    rewrite * /whatsapp/webhook{query}
    reverse_proxy integracao-service:3000
}
```

E confirmar/setar em `/opt/ipessp/integracao.env`:
```bash
N8N_WHATSAPP_WEBHOOK_URL=http://n8n:5678/webhook/930c3dd4-8cd0-4d66-a615-e2a959fedaf8
WEBHOOK_SECRET=<algum-valor>   # se ainda vazio, a checagem de origem do webhook fica desligada
```

Depois de editar o Caddyfile: `docker compose exec caddy caddy reload
--config /etc/caddy/Caddyfile` (ou `docker compose restart caddy`). Se
`WEBHOOK_SECRET` for setado/alterado: `docker compose up -d
integracao-service` pra recarregar o `.env`.
