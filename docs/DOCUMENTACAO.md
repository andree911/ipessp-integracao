# Documentação Técnica: Backend de Integração, ERP SophiA e Chatbot IA — IPESSP

Este documento descreve a arquitetura, a infraestrutura e as rotinas de manutenção do sistema de integração desenvolvido para o IPESSP (Instituto de Pesquisa e Educação em Saúde de São Paulo): backend de integração com o ERP SophiA, chatbot de atendimento via WhatsApp, réguas automáticas de cobrança e um frontend institucional (Next.js) desenvolvido mas nunca publicado em produção — o site institucional que está no ar hoje (`ipessp.edu.br`) é outro projeto, fora deste repositório.

---

## 1. Visão Geral da Arquitetura

```
Frontend Next.js deste projeto (não publicado)
  └── Formulários (contato, ouvidoria, evento, candidatura) ────┐
                                                                    │
WhatsApp (aluno/professor) ──► Z-API ──► n8n (Bot de Atendimento)  │
                                              │  IA + Tools          │
                                              ▼                      ▼
                                   ┌─────────────────────────────────┐
                                   │     Backend de Integração         │
                                   │     (NestJS — VPS, Docker)        │
                                   │  ├── /ia/*      dados do aluno/    │
                                   │  │              professor (Sophia)│
                                   │  ├── /v1/ti/*   chamados de TI     │
                                   │  ├── /v1/*      formulários do site│
                                   │  └── /health    health check       │
                                   └───────────────┬─────────────────┘
                                                     │
                            ┌────────────────────────┼────────────────────────┐
                            ▼                                                  ▼
                  ERP SophiA (terceirizado)                        PostgreSQL (VPS, self-hosted)
                  cron horário de sincronização                    cache local + formulários
                            │
                            ▼
              Jobs de régua de cobrança (e-mail + WhatsApp)
              leem o cache e notificam os alunos automaticamente
```

**Resumo do fluxo:** o backend de integração funciona como camada intermediária entre o frontend institucional, o bot de atendimento via WhatsApp e o ERP acadêmico terceirizado (SophiA). Uma rotina de sincronização horária busca os dados de alunos e financeiro do SophiA e mantém um cache local, usado tanto pelo chatbot quanto pelas réguas automáticas de cobrança — evitando consultar o ERP em tempo real a cada interação.

---

## 2. Infraestrutura e Hospedagem

### VPS própria (Hostinger)
O backend roda em **Docker Compose**, atrás de um proxy reverso **Caddy** (TLS automático), no diretório `/opt/ipessp/` do servidor — containers: `caddy`, `n8n`, `n8n-postgres` (banco próprio do n8n) e `integracao-service` (este backend). O domínio público (`srv1835634.hstgr.cloud`) roteia `/n8n/*` para o n8n e o restante das rotas (`/health`, `/v1/*`, `/ia/*` etc.) para o backend de integração.

O banco de dados **não está mais no Supabase** — os dados (cache do SophiA, formulários, chamados) migraram para o Postgres self-hosted da VPS, e o armazenamento de arquivos (currículos) migrou do Supabase Storage para o **MinIO** da VPS, mesma infraestrutura usada pelo restante do ecossistema.

### Frontend Next.js (não publicado)
Aplicação separada em **Next.js**, preparada para hospedagem na **Vercel** — **não é o site institucional que está no ar hoje.** O domínio real (`ipessp.edu.br`) é outro projeto, sem relação com este repositório; esta aplicação nunca chegou a ser publicada em produção, mas o código e as páginas (graduação, pós-graduação, cursos livres, corpo docente, blog, clínica-escola, laboratórios, trabalhe conosco, matrícula, fale conosco, ouvidoria, entre outras) estão prontos e documentados aqui.

### Deploy do backend
O diretório do serviço na VPS **não é um clone git** — o processo empacota apenas os arquivos versionados do commit e sincroniza por cima da pasta em produção, preservando `.env`, `node_modules` e dados locais:

```bash
# 1. Local: empacota o HEAD do repositório e envia para o servidor
git archive HEAD | ssh -i <chave-ssh> root@<ip-da-vps> \
  "rm -rf /tmp/integracao-deploy && mkdir -p /tmp/integracao-deploy && tar -x -C /tmp/integracao-deploy"

# 2. Servidor: sincroniza por cima da pasta viva (sem apagar o que não está no git)
ssh -i <chave-ssh> root@<ip-da-vps> \
  "rsync -a /tmp/integracao-deploy/ /opt/ipessp/integracao-service/ && rm -rf /tmp/integracao-deploy"

# 3. Servidor: rebuild e restart só do serviço afetado
ssh -i <chave-ssh> root@<ip-da-vps> \
  "cd /opt/ipessp && docker compose build integracao-service && docker compose up -d integracao-service"
```

**Verificação pós-deploy:** conferir os logs do container (`docker logs <container> --tail 60`, procurando "Nest application successfully started") e testar `GET /health`, que deve responder `200`.

As credenciais de acesso SSH e os arquivos `.env` de produção ficam sob responsabilidade da equipe de TI/infraestrutura, fora do repositório de código.

---

## 3. Módulos Desenvolvidos

### Portal do Aluno
O frontend Next.js deste projeto (ver Infraestrutura) nunca foi publicado — mas o **portal do aluno** dentro dele é a parte funcionalmente relevante: login próprio, financeiro, curso, notas, frequência, horário e documentos. Assim como o chatbot, consome as rotas do SophiA através do backend — notas, frequência, horário e dados da matrícula são buscados diretamente no ERP a cada acesso; o envio de documentos sobe o arquivo para o storage e registra o documento no cadastro do cliente na SophiA.

### Backend de Integração (NestJS)
Camada intermediária entre site, WhatsApp e ERP SophiA:
- **Integração com o ERP SophiA:** consulta de alunos, matrículas, financeiro, boletos, professores e turmas diretamente na API do ERP.
- **Sincronização automática:** rotina horária que busca todos os alunos e seus lançamentos financeiros no SophiA e grava em um cache local, usado pelo chatbot e pela régua de cobrança sem sobrecarregar o ERP.
- **Formulários institucionais:** recebe e processa envios de formulário (contato, ouvidoria, eventos, candidaturas) — endpoints prontos para o frontend deste projeto, com upload de arquivos (currículos) e notificação por e-mail à equipe responsável.
- **Chamados de TI:** abertura e consulta de chamados de suporte técnico, inclusive pelo chatbot de WhatsApp.
- **Suporte a Cancelamentos:** busca de aluno por nome/RA e resumo financeiro (parcelas em aberto, saldo devedor) a partir do cache local, além do disparo dos e-mails de confirmação de cancelamento (acadêmico, financeiro ou reembolso). Alimenta a tela de Cancelamentos do painel administrativo — o registro do cancelamento em si (e o cálculo de multa) não fica aqui, é feito em outro sistema do ecossistema.

### Chatbot de Atendimento via WhatsApp (n8n)
Bot de atendimento (IA + Z-API) orquestrado no n8n, consumindo os endpoints do backend de integração:
- Identifica o aluno/professor/funcionário pelo número de telefone.
- **Financeiro:** consulta pendências, envia boleto em PDF ou linha digitável/PIX direto na conversa.
- **Secretaria:** matrículas ativas do aluno, cronograma e turmas do professor.
- **TI:** abertura e consulta de chamados de suporte via WhatsApp.
- **Cursos:** catálogo de cursos disponíveis para orientar interessados.
- **Leads:** captura e encaminha o contato para o CRM (`ipessp-core`) — a variante do bot que roda ativa em produção hoje é justamente a "Encaminhar Leads".

### CRM (Leads) — desenvolvido no `ipessp-core`
Não faz parte do código deste projeto, mas os leads captados pelo site e pelo chatbot documentados aqui alimentam diretamente esse módulo: funil de leads, atribuição por rodízio entre consultoras comerciais, reatribuição manual quando necessário, nurturing automático via WhatsApp (orquestrado no n8n) e relatórios diário/semanal de funil e conversão, disponíveis ao vivo na aba CRM do painel administrativo.

### Comercial — desenvolvido no `ipessp-core`
Controle de vendas/matrículas por consultora, cálculo de comissões, dashboard e comparativos mensais, com relatório em PDF por e-mail. Alimentado por uma planilha sincronizada automaticamente do SharePoint/OneDrive a cada 15 minutos (Microsoft Graph) — o upload manual da planilha também continua disponível como alternativa, com detecção automática de colunas (apoio de IA) para lidar com os formatos de arquivo que coexistem hoje.

### Microsoft 365 / Teams — desenvolvido no `ipessp-core`
Também fora do código deste projeto. Ponto único de integração com o Microsoft Graph (client-credentials, Azure AD): agendamento automático de aulas/reuniões no Teams vinculado às turmas, gestão de usuários e grupos do Microsoft 365 e consulta de sign-ins. A sincronização da planilha comercial via SharePoint (mesma integração Graph) está descrita no módulo Comercial, acima.

### Régua de Cobrança Automática (E-mail + WhatsApp)
Rotina automatizada de lembretes e avisos de vencimento, com cron configurável:
- **E-mail:** lembretes de mensalidade nos dias configurados antes/depois do vencimento, com templates HTML.
- **WhatsApp (Z-API):** mesma lógica, mensagens estruturadas.
- Pode ser ligada/desligada em tempo real (sem redeploy) e testada manualmente por CPF ou lançamento específico antes de entrar em produção.

---

## 4. Sistemas e Serviços de Terceiros Integrados

| Serviço          | Função                                                             |
|-------------------|----------------------------------------------------------------------|
| **ERP SophiA**     | Sistema acadêmico terceirizado — fonte de dados de alunos, matrículas, financeiro e boletos |
| **Z-API**          | Envio e recebimento de mensagens do WhatsApp                          |
| **n8n**            | Orquestração do chatbot de atendimento e automações                   |
| **SMTP**           | Envio de e-mails transacionais e da régua de cobrança                 |

### O que é a Z-API
O WhatsApp (Meta) não oferece uma API pública própria para números comuns automatizarem envio/recebimento de mensagens — só a API Business oficial, que exige processo de verificação como empresa. A Z-API é um serviço terceirizado que faz essa ponte: mantém uma sessão de WhatsApp Web pareada com o número comercial do IPESSP e expõe isso como uma API HTTP comum, nos dois sentidos:
- **Envio:** o backend faz chamadas REST à Z-API (`send-text`, `send-option-list`, `send-image`, `send-document` etc.) para mandar mensagens — usado pelo chatbot e pelas réguas de cobrança.
- **Recebimento:** a Z-API é configurada com uma URL de webhook própria; toda mensagem recebida no número comercial é repassada via `POST` para essa URL. Essa URL cai primeiro numa exceção do Caddy que roteia pro backend, que trata a resposta de cobrança e repassa o resto pro n8n internamente — ver `backend/CONTEXT.md`, seção "Histórico: webhook da Z-API não chegava no backend", para o detalhe do roteamento.

As credenciais da instância (instance ID, token, client token) e a URL exata do webhook ficam só no `.env` de produção e no painel da própria Z-API — não são reproduzidas aqui.

---

## 5. Variáveis de Ambiente e Credenciais

Cada ambiente mantém seu próprio arquivo `.env` (fora do repositório de código, versionado apenas como `.env.example`). Os grupos principais:

| Categoria                  | Exemplos de variáveis                                              | Uso |
|------------------------------|-------------------------------------------------------------------|-------|
| Banco de dados               | `DATABASE_URL`, `DATABASE_SSL`                                     | Conexão com o Postgres self-hosted da VPS |
| ERP SophiA                    | `SOPHIA_BASE_URL`, `SOPHIA_USUARIO`, `SOPHIA_SENHA`, `SOPHIA_TENANT` | Integração com o ERP |
| Armazenamento                 | `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_PUBLIC_BASE_URL` | Storage de arquivos (currículos), substituiu o Supabase Storage |
| Autenticação da API           | `IA_BEARER_TOKEN`, `ADMIN_API_KEY`, `JWT_SECRET`                    | Proteção dos endpoints `/ia/*`, `/v1/ti/*` e `/v1/admin/*` |
| WhatsApp                      | `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`, `ZAPI_CLIENT_TOKEN` (canal "geral"); `ZAPI_FINANCEIRO_INSTANCE_ID`, `ZAPI_FINANCEIRO_TOKEN`, `ZAPI_FINANCEIRO_CLIENT_TOKEN` (canal "financeiro", régua de cobrança) | Envio/recebimento de mensagens |
| E-mail                        | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`                  | Envio de e-mails transacionais e de cobrança |
| Régua de cobrança             | `EMAIL_CRON_HABILITADO`, `EMAIL_DIAS_ANTES`, `EMAIL_DIAS_APOS`, `WPP_CRON_HABILITADO`, `WPP_DIAS_ANTES`, `WPP_DIAS_APOS` | Configuração dos jobs automáticos |
| Dados institucionais          | `ESCOLA_NOME`, `ESCOLA_TELEFONE`, `ESCOLA_SITE`, `ESCOLA_CNPJ`, `ESCOLA_EMAIL_NOTIFICACOES` | Usados em e-mails e templates |
| Sincronização                 | `SYNC_CRON`, `SYNC_LOOKBACK_DAYS`                                   | Configuração do cron de sincronização com o SophiA |

> Nenhum valor real de credencial deve constar em documentação ou repositório — apenas nos arquivos `.env` de cada ambiente, sob custódia da equipe de TI.

---

## 6. Status Atual e Recomendações de Manutenção

O sistema está em **operação em produção** na VPS, com a sincronização do SophiA e as réguas de cobrança rodando de forma automática e contínua.

### Recomendações importantes para a gestão:

1. **Dependência do ERP SophiA:** nem toda consulta do chatbot usa o cache local — `/ia/secretaria` (matrículas), `/ia/secretaria/professor` (dados do professor), `/ia/boleto` (download do PDF), `/ia/cursos` e `/ia/turma-detalhada` chamam o SophiA **ao vivo**, na hora da pergunta. Se o SophiA estiver lento ou fora do ar, essas respostas do bot travam ou falham no momento — diferente de `/ia/financeiro`, que lê do cache (`clientes_cache`/`lancamentos_cache`) e continua respondendo mesmo com o ERP indisponível, só com dado potencialmente desatualizado. Mudanças estruturais, quedas ou instabilidades nas rotas do SophiA devem ser reportadas formalmente ao suporte do fornecedor do ERP.
2. **Políticas antispam da Meta (WhatsApp):** o disparo em lote de mensagens de cobrança e do chatbot deve seguir os limites e cadências configurados para mitigar risco de bloqueio do número comercial junto à Meta/Z-API.
3. **Endpoints de teste e debug:** os endpoints de `/email/test/*` e `/v1/admin/*` enviam e-mails/consultas reais e não devem ficar acessíveis sem restrição em produção — usar apenas para validação pontual.
4. **Congelamento de escopo:** o sistema está configurado para execução automática e estável na VPS. Novas funcionalidades ou alterações de layout devem passar por análise prévia de escopo, arquitetura e viabilidade de tempo de desenvolvimento antes de novas implementações no código-fonte.

---

**Desenvolvido e documentado por:** Engenharia de Sistemas / TI Interna
**Status:** Em produção — homologação e monitoramento contínuo
