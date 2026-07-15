# Fluxos n8n — Evolution API (self-hosted)

Versão dos fluxos adaptada para [Evolution API](https://github.com/EvolutionAPI/evolution-api),
self-hosted (planejado: Hostinger), em vez de Z-API (`docs/`) ou 360dialog/Meta
Cloud API (`docs-meta/`).

> ⚠️ **Risco assumido conscientemente:** a Evolution API usa a biblioteca
> Baileys por baixo dos panos — o mesmo protocolo não-oficial de WhatsApp
> Web/multi-dispositivo que o Z-API usa. Hospedar você mesmo não muda isso:
> continua sendo automação não reconhecida pela Meta, com o mesmo risco de
> bloqueio de número que já aconteceu com o chip do Z-API. A vantagem real
> aqui é custo (sem cobrança por conversa da Meta, só custo de VPS) — não é
> uma solução mais estável que 360dialog/Cloud API. Essa troca foi decidida
> cientes do risco, priorizando viabilidade financeira (4 números na
> 360dialog ficava ~R$1200/mês).

**Arquitetura: 4 números dedicados, um por setor** (Financeiro, Secretaria,
TI, Marketing) — mesmo desenho de tools/restrição por setor de `docs-meta/`,
só muda o provedor por trás. Cada setor tem sua própria **instância** na
Evolution API (conectada via QR code a um número físico) e seu próprio bot
(`Bot-IPESSP-WhatsApp-<Setor>.json`).

---

## 1. O que muda tecnicamente (vs. `docs-meta/`, Meta Cloud API/360dialog)

| | Meta Cloud API / 360dialog (`docs-meta/`) | Evolution API (`docs-evolution-api/`) |
|---|---|---|
| Conexão do número | Registro direto na Meta (Business Manager), sem QR code | QR code (WhatsApp Web/multi-dispositivo), igual Z-API |
| Risco de bloqueio | Baixo — canal autorizado pela Meta | Igual ao Z-API — automação não-oficial |
| Envio de texto livre | Só dentro da janela de 24h, senão exige Template aprovado | Sempre permitido, sem restrição de janela nem template |
| Aprovação de conteúdo pela Meta | Obrigatória pra mensagem proativa (template) | Não existe — texto livre sempre |
| Endpoint de envio | `POST {WHATSAPP_SEND_URL}` (`waba-v2.360dialog.io/messages`) | `POST {EVOLUTION_API_URL}/message/sendText/{instance}` |
| Autenticação | Header `D360-API-KEY`, uma key por canal | Header `apikey`, key global (padrão) |
| Payload de entrada (webhook) | `entry[].changes[].value.messages[]` (Meta) | Evento `messages.upsert`, estrutura Baileys (`data.key.remoteJid`, `data.message.conversation`) |

Como a Evolution API não tem restrição de janela/template, os fluxos
proativos (`Notificação-chamado-TI.json`, `CRM-IPESSP-Leads-completo.json`)
ficaram **mais simples** que a versão `docs-meta/`: voltam a mandar texto
livre direto (igual à versão Z-API original em `docs/`), sem precisar
cadastrar/aprovar nada na Meta.

---

## 2. ⚠️ Pendência importante: confirmar o payload real do webhook

O nó de código **"Webhook"** em cada bot (normaliza a mensagem recebida) foi
escrito com base no formato **documentado/conhecido** da Evolution API para o
evento `messages.upsert` (estrutura derivada da lib Baileys):

```json
{
  "event": "messages.upsert",
  "instance": "ipessp-financeiro",
  "data": {
    "key": { "remoteJid": "5511999999999@s.whatsapp.net", "fromMe": false, "id": "..." },
    "message": { "conversation": "texto da mensagem" }
  }
}
```

Isso **não foi confirmado campo a campo contra a documentação oficial mais
recente** no momento em que este fluxo foi escrito — a doc pública não
detalhava o payload completo do evento nessa consulta. **Antes de ativar em
produção:**

1. Suba a instância na Evolution API, conecte um número de teste via QR code.
2. Configure o webhook apontando pra um workflow n8n temporário só com um nó
   de Webhook + um nó "Set" pra capturar o payload bruto (ou use a aba de
   execuções do n8n pra inspecionar o JSON recebido).
3. Mande uma mensagem de teste pro número e veja o payload real.
4. Compare com o código do nó "Webhook" de qualquer um dos 4 bots — se os
   nomes de campo baterem (`data.key.remoteJid`, `data.message.conversation`
   etc.), pode ativar. Se divergir, ajuste o Code node **nos 4 arquivos**
   (a lógica é idêntica nos 4, só copiar o node ajustado).

Isso vale só pro parsing de entrada — o envio (`POST /message/sendText/{instance}`,
header `apikey`, body `{ number, textMessage: { text } }`) foi confirmado
direto na documentação oficial da Evolution API e não deve mudar.

---

## 3. Variáveis de ambiente novas (`docs-evolution-api/.env.example`)

| Variável | Uso |
|---|---|
| `EVOLUTION_API_URL` | URL base da instância self-hosted (Hostinger) |
| `EVOLUTION_API_KEY` | API key global da Evolution API (`AUTHENTICATION_API_KEY` do servidor) |
| `EVOLUTION_INSTANCE_FINANCEIRO` / `..._SECRETARIA` / `..._TI` / `..._MARKETING` | Nome de cada instância conectada (uma por número) |
| `WHATSAPP_TELEFONE_EQUIPE` | Número da equipe (canal Marketing) que recebe notificação de lead/relatórios |

---

## 4. Setores, números e tools de cada bot

Igual `docs-meta/` — nada muda na divisão de tools por setor, só o provedor:

| Setor | Arquivo | Tools conectadas ao AI Agent | Contexto de CPF pré-carregado? |
|---|---|---|---|
| Financeiro | `Bot-IPESSP-WhatsApp-Financeiro.json` | Consultar Financeiro, Enviar Boleto PDF, Salvar CPF do Telefone | Sim |
| Secretaria | `Bot-IPESSP-WhatsApp-Secretaria.json` | Consultar Secretaria, Consultar Professor, Listar Alunos da Disciplina, Consultar Avisos, Consultar Calendário, Salvar CPF do Telefone | Sim |
| TI | `Bot-IPESSP-WhatsApp-TI.json` | Abrir Chamado TI, Consultar Chamados TI | Não |
| Marketing | `Bot-IPESSP-WhatsApp-Marketing.json` | Verificar Lead CRM, Registrar Lead CRM, Consultar Cursos | Não |

Cada Agent só tem as tools da própria linha — a restrição por setor é
estrutural (a tool nem existe no fluxo errado), não só por instrução de
prompt. Cada prompt também redireciona educadamente pro `wa.me/<número>`
certo se o assunto for de outro setor.

---

## 5. Passo a passo até ativar

1. Provisionar o VPS na Hostinger e subir a Evolution API (Docker é o método
   oficial recomendado) + seu próprio Postgres/Redis conforme a doc da
   Evolution API.
2. Criar as **4 instâncias** (`ipessp-financeiro`, `ipessp-secretaria`,
   `ipessp-ti`, `ipessp-marketing`) e conectar cada uma a um número via QR
   code — **use chips genuinamente novos**, não o chip já bloqueado.
   Aqueça cada número aos poucos nos primeiros dias (poucas mensagens),
   já que aqui não existe suporte oficial de BSP pra apelar em caso de bloqueo.
3. Configurar o webhook de cada instância apontando pro path do bot
   correspondente no n8n (`/webhook/ipessp-whatsapp-<setor>`).
4. **Fazer o teste da seção 2 antes de tudo** — confirmar o payload real do
   webhook e ajustar o Code node "Webhook" se necessário.
5. Preencher o `.env` real com `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e os
   4 `EVOLUTION_INSTANCE_*`.
6. Rodar `documentacao/sql/lead_add_whatsapp_optin.sql` no banco antes de
   subir o backend com as mudanças de opt-in, se ainda não tiver rodado.
7. Importar os 4 bots + `Notificação-chamado-TI.json` +
   `CRM-IPESSP-Leads-completo.json` no n8n, inativos, testar em conversa
   real em cada um dos 4 números antes de ativar.
