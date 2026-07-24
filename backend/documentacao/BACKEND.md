# Backend — Integração Sophia × n8n (IPESSP)

Backend NestJS que serve como camada intermediária entre o site institucional, o bot de atendimento WhatsApp (n8n), o ERP SophiA, o Mercado Pago e o banco Supabase. Também compartilha o banco com o projeto `ipessp-corporativo`.

IPESSP = Instituto de Pesquisa e Educação em Saúde de São Paulo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS (TypeScript) |
| Banco | Supabase PostgreSQL (compartilhado com `ipessp-corporativo`) |
| ORM | TypeORM (`synchronize: true`) |
| ERP | SophiA REST API |
| Pagamento | Mercado Pago (checkout da 1ª parcela de matrícula) |
| Mensageria | Z-API (WhatsApp) |
| E-mail | SMTP (Nodemailer) |
| Automação | n8n |
| Deploy | Render (free tier — dorme por inatividade) |

---

## Arquitetura geral

```
Site institucional
  ├── Formulários (contato, manifestação, evento, candidatura) → /v1/*
  └── Solicitação de matrícula → /v1/matriculas → Mercado Pago (checkout 1ª parcela)
                                       │
                                       ▼
                              Webhook MP aprovado → /v1/pagamentos/mp-webhook
                                       │
                                       ▼
                        Backend cria Cliente automaticamente no Sophia (POST /clientes)
                        e notifica o financeiro (e-mail + WhatsApp) para efetivar a
                        matrícula manualmente (ver seção "Matrícula + pagamento" abaixo)

WhatsApp (usuário) ──► Z-API ──► n8n Bot Flow (AI Agent + Tools)
                                       │
                                       ▼
                               NestJS Backend (Render)
                               ├── /ia/*          → Dados do aluno/professor (Sophia + Supabase)
                               ├── /v1/ti/*       → Abertura e consulta de chamados (Supabase)
                               ├── /v1/leads/*    → CRM de leads (usado pelo n8n e pelo dashboard)
                               ├── /v1/admin/*    → Endpoints administrativos / debug
                               └── /health        → Keep-alive ping (evita sleep do Render)

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
| `IaBearerGuard` | `/ia/*`, `/v1/leads/*`, `/v1/ti/*`, `/v1/matriculas` | Bearer token fixo (`IA_BEARER_TOKEN`) |
| `AdminApiKeyGuard` | `/v1/admin/*` | API key separada (`ADMIN_API_KEY`) |
| Assinatura HMAC | `/v1/pagamentos/mp-webhook` | Valida header `x-signature` do Mercado Pago contra `MP_WEBHOOK_SECRET` |
| Sem guard (público, com rate limit) | `/v1/candidaturas`, `/v1/mensagens-contato`, `/v1/manifestacoes`, `/v1/solicitacoes-eventos` | `ThrottlerGuard` do NestJS limita abuso |

```
Authorization: Bearer <IA_BEARER_TOKEN>
```

> **Atenção — pegadinha de nomes:** no frontend (`site-ipessp-frontend`), as rotas proxy `POST /api/matriculas` e `POST /api/lead` injetam `MATRICULAS_API_KEY` e `LEADS_API_KEY` respectivamente como esse Bearer token. Apesar do nome diferente de cada lado, **os três (`IA_BEARER_TOKEN` aqui, `MATRICULAS_API_KEY` e `LEADS_API_KEY` no frontend) precisam ser exatamente o mesmo valor** — não são segredos independentes. Se algum for gerado/rotacionado sem replicar nos outros dois, o formulário de matrícula ou a captura de lead do site passam a falhar com 401 sem aviso visível pro usuário.

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

### `/v1/matriculas` — Solicitação de matrícula (site)

#### `POST /v1/matriculas`
Recebe dados do aluno, responsável (opcional), curso e plano de pagamento vindos do site. Gera uma preferência de pagamento no Mercado Pago para a 1ª parcela, salva tudo em `matriculas_cache` (tabela `MatriculaCache`) e envia o link de pagamento ao aluno/responsável por WhatsApp e e-mail. **Não toca no Sophia neste momento** — a matrícula só é registrada no ERP depois que o pagamento é aprovado (ver `/v1/pagamentos/mp-webhook`).

---

### `/v1/pagamentos` — Webhook Mercado Pago

#### `POST /v1/pagamentos/mp-webhook`
Recebe a notificação do Mercado Pago, valida a assinatura HMAC (`x-signature` + `MP_WEBHOOK_SECRET`), busca o pagamento na API do MP e, se `status === 'approved'`:

1. Chama `POST /clientes` no Sophia automaticamente (`SophiaService.criarCliente`, com `interesse` preenchido a partir do curso/turno/período/unidade salvos em `MatriculaCache`, e `enviarEmail=false` pra não disparar e-mail automático do Sophia).
2. Notifica o financeiro por WhatsApp (`ZAPI_TELEFONE_FINANCEIRO`) e e-mail (`ESCOLA_EMAIL_NOTIFICACOES`) — se o passo 1 deu certo, a notificação já vem com o **código do cliente no Sophia**, e a secretaria só precisa efetivar a matrícula (conversão cliente→aluno é manual, sem endpoint de API pra isso — ver seção abaixo). Se falhar, a notificação cai no formato antigo, com todos os dados pra cadastro manual do zero.

A notificação manual nunca é pulada — ela é o fallback de segurança tanto pra falha técnica quanto pro passo de conversão cliente→aluno, que continua sempre humano.

Idempotência contra reentrega do MP: em vez de checar `notificadoEm` e só gravar no fim, o backend faz um `UPDATE ... WHERE notificadoEm IS NULL` atômico logo no início — se duas reentregas do mesmo evento chegarem quase simultâneas, só uma consegue "reivindicar" a linha em `MatriculaCache`, evitando cliente duplicado no Sophia.

---

### `/v1/leads` — CRM de leads

Protegido por `IaBearerGuard`. Usado tanto pelo fluxo de nutrição do n8n quanto pelo dashboard visual do CRM.

| Endpoint | Descrição |
|---|---|
| `POST /v1/leads` | Cria um lead (nome, e-mail, telefone, curso de interesse, origem) |
| `GET /v1/leads` | Lista leads com filtro por status/origem/telefone/data e paginação |
| `GET /v1/leads/:id` | Detalhe de um lead |
| `GET /v1/leads/:id/historico` | Histórico de interações do lead |
| `PATCH /v1/leads/:id` | Atualiza dados do lead |
| `PATCH /v1/leads/:id/estagio` | Move o lead entre estágios do funil |
| `PATCH /v1/leads/:id/vincular-aluno` | Vincula o lead a um código de aluno do Sophia (marca como matriculado) |
| `PATCH /v1/leads/:id/nurturing-avanco` | Avança manualmente uma etapa do fluxo de nutrição |
| `GET /v1/leads/relatorio` / `relatorio/diario` | Métricas do funil |
| `GET /v1/leads/prontos-para-contato` | Leads cuja etapa de nutrição (5 min → 1 dia → 2 dias) já venceu, para o bot/atendente contatar |
| `POST /v1/leads/registrar-interacao-bot` | Registra que o bot interagiu com o lead (pausa a nutrição automática) |
| `POST /v1/leads/reativar-nurturing` | Reativa nutrição pausada em massa |
| `PATCH /v1/leads/:id/reatribuir` | Reatribui o lead pra outra consultora (rodízio manual, ex: a atual avisou que não vai atender) |

O `SyncService` também reconcilia leads automaticamente: se o e-mail de um lead aparece como aluno matriculado no Sophia, o lead é marcado como `matriculado` (`sync.service.ts` → `reconciliarLeadsPagina`).

**Rodízio de notificação entre consultoras** — assim que a IA registra um lead novo, `LeadsService.notificarConsultoras` escolhe UMA consultora por vez (nunca repete a mesma duas seguidas) dentre os números em `ZAPI_TELEFONES_CONSULTORAS_MARKETING`, envia a notificação por WhatsApp só pra ela e grava o número escolhido em `lead.consultoraResponsavel` (e o instante em `lead.atribuidoEm`) — campos visíveis pela aba de leads do corporativo, já que a tabela `lead` é compartilhada (hoje ela lê via `GET /v1/admin/leads*`, não direto do Supabase — ver `AdminController`). O índice da próxima consultora fica na tabela singleton `lead_distribuicao_consultoras` (linha `id=1`), travada com `pessimistic_write` dentro de uma transação para serializar leads concorrentes.

**Reatribuição** — se a consultora atual não conseguir atender, o lead pode ser passado pra outra de duas formas, ambas via `LeadsService.executarReatribuicao` (que reenvia o WhatsApp pra nova consultora e loga em `LeadHistorico`, sem mexer no índice do rodízio — isso afeta só os PRÓXIMOS leads novos):
- **Manual**: `PATCH /v1/leads/:id/reatribuir` (espelhado em `PATCH /v1/admin/leads/:id/reatribuir`) — passa pro próximo número da lista após o atual.
- **Automática (timeout)**: cron `reatribuirLeadsSemAtendimento` (a cada 5 min) reatribui todo lead que ficou parado em `status = 'novo'` por mais de 20 min desde `atribuidoEm` — sinal de que ninguém moveu o funil ainda. Precisa de pelo menos 2 números configurados em `ZAPI_TELEFONES_CONSULTORAS_MARKETING`.

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
| `GET /v1/admin/leads`, `/leads/:id`, `/leads/:id/historico`, `/leads/funil` | Espelham `/v1/leads`, usados pelo dashboard admin |
| `PATCH /v1/admin/leads/:id/estagio` | Move estágio do lead |
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

O ciclo (`SyncService.runSync`) busca todos os alunos do Sophia, para cada um busca responsável financeiro e lançamentos, grava em `clientes_cache` / `lancamentos_cache`, e reconcilia leads cujo e-mail bateu com um aluno matriculado.

---

### `/` — Diversos

#### `GET /health`
Endpoint público para keep-alive. Retorna `{ status: 'ok' }`. O fluxo n8n **Keep-alive backend** faz GET neste endpoint a cada 10 minutos para evitar que o Render coloque o serviço para dormir.

#### `GET /como-pagar`
Página HTML estática (sem dependência de banco) explicando ao aluno como pagar a mensalidade pelo Portal do Aluno Sophia — usada como link em e-mails/WhatsApp de cobrança.

---

## Matrícula + pagamento — decisão de arquitetura

Contexto: substituição do Rubeus/TOTVS pelo SophiA. A API pública do Sophia não tem `POST` para criar aluno do zero nem para acordos/planos de pagamento customizados — só `POST /clientes` (prospecto) e `POST /alunos/{idAluno}/Matriculas` (matricula um aluno **já existente**, com parcelas seguintes pela tabela de preço do curso configurada dentro do próprio Sophia).

"Bolecode" **não é um produto do Sophia** — é a API do banco Itaú (boleto híbrido/PIX) que o próprio Sophia consome internamente com credencial e certificado próprios. Confirmado com o time: a emissão de boleto dentro do Sophia é feita por um processo/ação manual de lá (não é instantânea nem automática por lançamento). **Decisão: nunca integrar direto com o Bolecode/Itaú a partir deste backend.** Se o backend emitisse boletos direto no banco, esse boleto nunca apareceria no Sophia (não há sincronização reversa Itaú → Sophia), quebrando a garantia de que o Sophia é a fonte de verdade financeira do aluno.

**Cliente ≠ Aluno no Sophia — confirmado.** `POST /clientes` cria um prospecto num cadastro totalmente separado do de "Alunos" (telas e códigos independentes dentro do Sophia). Não existe, em nenhum lugar da API, um endpoint para converter um Cliente em Aluno — essa conversão (que provavelmente já inclui a matrícula em si, geração de RA, plano de pagamento e afins) é feita manualmente pela secretaria dentro do Sophia. Ou seja, o `POST /alunos/{idAluno}/Matriculas` só serve para um aluno **que já existe** (ex.: rematrícula, curso adicional) — não para o cadastro inicial de um aluno novo.

**Fluxo implementado (matrícula nova pelo site) — escopo fechado:**
1. Mercado Pago cobra a 1ª parcela (cartão/PIX/boleto do MP).
2. Webhook aprovado → backend chama `POST /clientes` automaticamente no Sophia (dados do aluno/responsável/curso já preenchidos, `interesse` com curso/turno/período/unidade).
3. Notificação ao financeiro (WhatsApp + e-mail) — com o código do cliente já criado, se deu certo — para a secretaria efetivar a matrícula manualmente no Sophia. Se o passo 2 falhar, a notificação cai no formato de cadastro manual completo (fallback).
4. **Daqui pra frente é 100% manual, numa ação só dentro do Sophia**: transformar Cliente em Aluno + matricular + gerar o plano de pagamento completo (todas as parcelas, pela tabela de preço do curso já configurada). A emissão do boleto/PIX de cada parcela em si segue o processo interno/manual do Sophia (não instantâneo, não por lançamento).

O Mercado Pago é mantido mesmo com essa automação — ele processa cartão (que o Bolecode não suporta) e funciona como filtro: só quem paga vira cliente real no Sophia. **`POST /alunos/{idAluno}/Matriculas` não faz parte deste fluxo** — não há como encadear `POST /clientes` → `POST /Matriculas` automaticamente, porque no momento da criação do Cliente ainda não existe `idAluno` nenhum (é exatamente esse o motivo de o passo 4 ser manual).

Ainda não confirmado por falta de teste em produção (não testar com CPF de aluno real sem necessidade):
- O formato exato aceito pelo campo `interesse` do `POST /clientes` (implementado como `{ curso: { descricao }, turno: { descricao }, periodo: { descricao }, unidade: { descricao } }` em `SophiaService.criarCliente` — baseado no schema do swagger, mas nunca validado contra uma resposta real). Hoje o site (`app/matricula` no frontend) coleta `curso`/`unidade`/`periodoLetivo` como texto livre, então o `interesse` só vai ficar visualmente correto pra secretaria se o texto digitado bater com o catálogo — considerar trocar por `<select>` alimentado por `GET /ia/cursos` (e futuros `/ia/unidades`, `/ia/periodos`) se isso incomodar na prática.

**Nota histórica:** o backend já teve endpoints (`POST /ia/prospectivo`, `POST /ia/responsavel`, `POST /ia/matricula`) que chamavam `POST /clientes`, `POST /alunos/{id}/responsaveis` e `POST /alunos/{id}/Matriculas` diretamente, pensados numa versão anterior do fluxo de rematrícula. Nenhum dos três chegou a ser ligado a um fluxo real (nem bot, nem site) e foram removidos do código — quem cria o Cliente no Sophia hoje é só o webhook do Mercado Pago (`MercadoPagoController.notificarPagamentoAprovado`), direto via `SophiaService.criarCliente`. Se um fluxo de rematrícula (matricular aluno já existente em curso adicional) for revisitado no futuro, esses métodos precisam ser recriados do zero — a lógica descrita neste documento sobre `POST /alunos/{idAluno}/Matriculas` continua valendo como referência de como a API se comporta, só não há mais código chamando.

---

## Entidades TypeORM (banco compartilhado Supabase)

| Entidade | Tabela | Descrição |
|---|---|---|
| `TelefoneCpfCache` | `telefone_cpf_cache` | Associação telefone → CPF + tipo + e-mail |
| `ClienteCache` | `clientes_cache` | Cache de clientes/alunos do Sophia (`codigoSophia` = `idAluno`) |
| `LancamentoCache` | `lancamentos_cache` | Cache de lançamentos financeiros, incluindo `linhaDigitavel`, `codigoPix`, `codigoBoleto`, `urlBoleto` |
| `ResponsavelCache` | `responsavel_cache` | Cache do responsável financeiro vinculado a cada aluno por CPF — alimentado pelo `SyncService`, lido por `GET /ia/secretaria` |
| `MatriculaCache` | `matriculas_cache` | Solicitações de matrícula pelo site + dados do pagamento Mercado Pago + `codigoClienteSophia`/`notificadoEm` (idempotência do webhook) |
| `Chamado` | `chamados` | Chamados de TI (compartilhado com corporativo) |
| `EmailLog` | `email_log` | Log de e-mails enviados |
| `Lead` / `LeadHistorico` | `lead` / `lead_historico` | CRM de leads |
| `LeadDistribuicaoConsultoras` | `lead_distribuicao_consultoras` | Estado do rodízio de notificação entre consultoras (linha única) |
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
| `criarCliente` | Cadastro de prospecto (`POST /clientes`) — chamado hoje só pelo webhook do Mercado Pago aprovado |
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
| `Bot-IPESSP-WhatsApp.json` | Bot de atendimento (AI Agent) — financeiro, secretaria, TI, avisos, calendário, cursos, captura de lead e envio de boleto em PDF |
| `Keep-alive-backend.json` | Ping a `/health` a cada 10 min (evita sleep do Render) |
| `Notificação-chamado-TI.json` | Notifica solicitante via WhatsApp quando chamado muda de status |
| `CRM-IPESSP-Leads-completo.json` | CRM de leads: notificação de novo lead, nutrição automática (a cada 30 min), relatórios diário/semanal e reativação de leads pausados |

Todos os 4 usam `$env.NOME` (n8n auto-hospedado no Render — variáveis reais configuradas no painel do serviço n8n, não pela feature paga "Variables" do n8n Cloud).

---

## Credenciais relevantes (variáveis de ambiente)

| Variável | Uso |
|---|---|
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `SOPHIA_BASE_URL`, `SOPHIA_USUARIO`, `SOPHIA_SENHA`, `SOPHIA_TENANT` | Credenciais do ERP SophiA |
| `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` | Projeto Supabase (dados + storage de currículos) |
| `IA_BEARER_TOKEN` | Token Bearer de `/ia/*`, `/v1/leads/*`, `/v1/ti/*` e `/v1/matriculas` — precisa ser igual a `MATRICULAS_API_KEY`/`LEADS_API_KEY` no frontend (ver seção Autenticação) |
| `ADMIN_API_KEY` | Chave dos endpoints `/v1/admin/*` |
| `JWT_SECRET` | Obrigatório — sem ele a aplicação não sobe |
| `WEBHOOK_SECRET` | (reservado para webhooks internos) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Envio de e-mail transacional |
| `EMAIL_CRON_HABILITADO`, `EMAIL_DIAS_ANTES`, `EMAIL_DIAS_APOS`, `EMAIL_LOGO_URL`, `EMAIL_PORTAL_ALUNO_URL` | Job de cobrança por e-mail |
| `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN`, `ZAPI_TELEFONE_FINANCEIRO` | Envio de WhatsApp (Z-API) |
| `WPP_CRON_HABILITADO`, `WPP_DIAS_ANTES`, `WPP_DIAS_APOS` | Job de cobrança por WhatsApp |
| `ESCOLA_NOME`, `ESCOLA_TELEFONE`, `ESCOLA_SITE`, `ESCOLA_CNPJ`, `ESCOLA_ENDERECO`, `ESCOLA_EMAIL_NOTIFICACOES`, `ESCOLA_INSTAGRAM`, `ESCOLA_FACEBOOK`, `ESCOLA_YOUTUBE`, `ESCOLA_LINKEDIN` | Dados institucionais usados em e-mails/templates |
| `N8N_LEADS_WEBHOOK_URL` | Webhook do n8n acionado por eventos de lead |
| `MP_ACCESS_TOKEN`, `MP_SANDBOX`, `MP_SUCCESS_URL`, `MP_FAILURE_URL`, `MP_PENDING_URL`, `MP_NOTIFICATION_URL`, `MP_WEBHOOK_SECRET` | Mercado Pago (checkout + webhook da 1ª parcela de matrícula) |
| `BACKEND_URL`, `SITE_URL` | URLs usadas em callbacks/links gerados |
| `SYNC_CRON`, `SYNC_LOOKBACK_DAYS` | Configuração do cron de sincronização Sophia → cache |

---

## Deploy (Render)

- Free tier: dorme após ~15 min de inatividade
- Solução: fluxo n8n Keep-alive faz GET `/health` a cada 10 min enquanto ativo
- Para produção real: considerar upgrade para paid tier ou migrar para Railway/Fly.io
