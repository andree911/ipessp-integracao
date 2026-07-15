# Infra Hostinger — n8n + Postgres + Evolution API + Redis

Stack Docker Compose pra rodar, no mesmo VPS da Hostinger: n8n, o Postgres
dele, a Evolution API (self-hosted), o Postgres e o Redis dela, e o Caddy
como reverse proxy com HTTPS automático (Let's Encrypt).

O backend NestJS (este repo) **continua no Render** — não faz parte desta
stack.

---

## 1. Contratar o VPS

Especificação mínima recomendada: **4GB RAM, 2 vCPU, 80GB SSD, Ubuntu 22.04
ou 24.04 LTS**. Confira no painel da Hostinger o plano de VPS que atenda ou
supere isso.

## 2. Apontar o DNS

Antes de subir os containers, crie 2 registros DNS tipo **A** apontando pro
IP do VPS (vocês já têm acesso ao DNS de `ipessp.edu.br`):

| Subdomínio | Tipo | Valor |
|---|---|---|
| `n8n.ipessp.edu.br` | A | IP do VPS |
| `evolution.ipessp.edu.br` | A | IP do VPS |

O Caddy só consegue emitir certificado HTTPS depois que o DNS já estiver
resolvendo pro VPS — espere propagar (geralmente minutos, pode levar até
algumas horas) antes de tentar subir a stack.

## 3. Preparar o VPS

Via SSH, instale o Docker e o Docker Compose plugin:

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# desconecte e reconecte o SSH pra aplicar o grupo docker
```

## 4. Copiar os arquivos desta pasta pro VPS

Copie `docker-compose.yml`, `Caddyfile` e `.env.example` pra um diretório no
VPS (ex.: `/opt/ipessp/`), via `scp` ou clonando o repo lá.

```bash
cp .env.example .env
```

Preencha o `.env` com valores reais:
- `N8N_DB_PASSWORD` / `EVOLUTION_DB_PASSWORD`: senhas fortes, geradas por
  você (ex.: `openssl rand -hex 24`)
- `N8N_ENCRYPTION_KEY`: `openssl rand -hex 32`
- `EVOLUTION_API_KEY`: `openssl rand -hex 32`
- `CORE_API_URL`: já vem preenchido — é o backend no Render, não muda
- `IA_BEARER_TOKEN`: mesmo valor que já está configurado no Render do backend
- `WHATSAPP_TELEFONE_EQUIPE`: telefone da equipe que recebe notificação de
  lead/relatórios

Os `EVOLUTION_INSTANCE_*` podem ficar com os valores padrão do
`.env.example` (`ipessp-financeiro`, etc.) — são só os nomes que serão
criados no passo 6.

## 5. Subir a stack

```bash
docker compose up -d
docker compose logs -f
```

Confira que os 6 containers sobem sem erro (`caddy`, `postgres_n8n`,
`postgres_evolution`, `redis_evolution`, `n8n`, `evolution_api`) e que o
Caddy conseguiu emitir os certificados (`docker compose logs caddy`).

Acesse `https://n8n.ipessp.edu.br` — deve abrir a tela de setup do n8n.

## 6. Criar as 4 instâncias na Evolution API e conectar os números

Via a API da Evolution (`https://evolution.ipessp.edu.br`, header `apikey:
<EVOLUTION_API_KEY>`), crie uma instância por setor e escaneie o QR code
retornado com um **número novo** (não o chip bloqueado):

```bash
curl -X POST https://evolution.ipessp.edu.br/instance/create \
  -H "apikey: <EVOLUTION_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{"instanceName": "ipessp-financeiro", "qrcode": true, "integration": "WHATSAPP-BAILEYS"}'
```

Repita pra `ipessp-secretaria`, `ipessp-ti`, `ipessp-marketing`. O QR code
vem na resposta (ou consulte `GET /instance/connect/{instanceName}`).

Depois de conectado, configure o webhook de cada instância apontando pro
path do bot correspondente no n8n:

```bash
curl -X POST https://evolution.ipessp.edu.br/webhook/set/ipessp-financeiro \
  -H "apikey: <EVOLUTION_API_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "webhook": {
      "url": "https://n8n.ipessp.edu.br/webhook/ipessp-whatsapp-financeiro",
      "events": ["MESSAGES_UPSERT"]
    }
  }'
```

Repita trocando `ipessp-financeiro` pelo nome de cada instância e o path do
webhook pelo setor correspondente (`ipessp-whatsapp-secretaria`,
`ipessp-whatsapp-ti`, `ipessp-whatsapp-marketing`).

> ⚠️ **Antes de seguir pro fluxo real**: confirme o payload que chega no n8n
> (ver `docs-evolution-api/README.md`, seção 2) com uma mensagem de teste,
> usando um workflow temporário só com um Webhook + Set node pra inspecionar
> o JSON. Ajuste o Code node "Webhook" dos 4 bots se algum nome de campo
> divergir do que foi assumido.

## 7. Importar os fluxos no n8n

Importe os 6 arquivos de `docs-evolution-api/` (os 4 bots + os 2 fluxos
proativos), deixe inativos, teste em conversa real em cada um dos 4 números,
e só então ative.

## 8. Backend (Render)

Depois que a instância Financeiro estiver conectada e testada, preencha no
Render: `EVOLUTION_API_URL` (`https://evolution.ipessp.edu.br`),
`EVOLUTION_API_KEY` (mesmo valor do `.env` desta stack),
`EVOLUTION_INSTANCE_FINANCEIRO` (`ipessp-financeiro`),
`WHATSAPP_TELEFONE_FINANCEIRO`.
