# Fluxos n8n — API oficial da Meta (Cloud API)

Versão paralela dos fluxos de `docs/` adaptada para a WhatsApp Business Platform
(Cloud API) da Meta, em vez do Z-API. Motivo: Z-API (e qualquer provedor
baseado em QR code/protocolo do WhatsApp Web) é automação não-oficial, e a
Meta pode banir o número por isso — foi o que aconteceu com o chip atual. A
Cloud API não usa QR code: o número é registrado direto na Meta via Business
Manager, eliminando esse risco.

**Decisão fechada: 360dialog** como provedor (não Meta direta, nem
Twilio/Gupshup). Motivo: suporte dedicado deles resolve o problema atual de
ficar sem resposta da Meta, e o payload que eles expõem é idêntico ao da
Cloud API oficial — os nós de envio já criados aqui funcionam sem
reescrever nada, só preenchendo `WHATSAPP_SEND_URL`/`WHATSAPP_AUTH_HEADER_*`
com os valores da 360dialog (ver seção 2). As instruções de Meta direta
ficam documentadas como referência/fallback, não como caminho ativo.

**Nada em `docs/` (Z-API) ou no backend NestJS foi alterado.** Estes arquivos
só entram em produção quando o número novo dedicado à Cloud API estiver
provisionado e os templates abaixo aprovados.

---

## 1. O que muda tecnicamente

| | Z-API (`docs/`) | Meta Cloud API (`docs-meta/`) |
|---|---|---|
| Conexão do número | QR code (WhatsApp Web) | Registro direto na Meta (Business Manager), sem QR code |
| Webhook de entrada | Só POST, payload simples (`body.phone`, `body.text.message`) | GET de verificação (handshake) + POST com payload aninhado (`entry[].changes[].value.messages[]`) |
| Envio de texto livre | Sempre permitido | Só dentro da janela de 24h após a última mensagem do usuário |
| Envio proativo (fora da janela de 24h) | Texto livre, sem restrição | **Obrigatório usar Template pré-aprovado pela Meta** |
| Menu de opções | `send-option-list` | Mensagem `interactive` tipo `list` (limites de tamanho: título de linha ≤24 caracteres, descrição ≤72, botão ≤20) |

O `Bot-IPESSP-WhatsApp.json` deste diretório mantém a mesma lógica/tools do
original — só o webhook de entrada e os 3 nós de envio (`Enviar Resposta
WhatsApp`, `Responder Mídia Não Suportada`, `Enviar Menu Inicial`) mudaram.
Um nó de código chamado **"Webhook"** (não é mais o trigger, é um Code node)
normaliza o payload da Meta pro mesmo formato que a Z-API usava
(`{ body: { phone, fromMe, text, listResponseMessage } }`) — por isso todas
as outras 20+ tools do AI Agent não precisaram ser tocadas.

O bot responde dentro da janela de 24h (conversa iniciada pelo aluno/professor
no WhatsApp), então pode continuar usando mensagem de texto livre (`type:
text`) sem template — é só o menu inicial que virou `interactive/list` em vez
de `send-option-list`.

Já `Notificação-chamado-TI.json` e `CRM-IPESSP-Leads-completo.json` mandam
mensagens **proativas** (a instituição inicia a conversa) — por isso todos os
envios desses dois fluxos viraram `type: template`, exigindo os templates
abaixo aprovados na Meta antes de funcionar.

---

## 2. Variáveis de ambiente novas (`docs-meta/.env.example`)

| Variável | Uso |
|---|---|
| `WHATSAPP_SEND_URL` | URL completa de envio. Meta direta: `https://graph.facebook.com/v20.0/<PHONE_NUMBER_ID>/messages`. 360dialog: `https://waba-v2.360dialog.io/messages` |
| `WHATSAPP_AUTH_HEADER_NAME` / `WHATSAPP_AUTH_HEADER_VALUE` | Nome+valor do header de auth. Meta: `Authorization` / `Bearer <ACCESS_TOKEN>`. 360dialog: `D360-API-KEY` / `<API_KEY>` |
| `META_WEBHOOK_VERIFY_TOKEN` | Só p/ Meta direta — token arbitrário que você escolhe e cadastra no painel do App (Webhook > Verify Token) |
| `WHATSAPP_TELEFONE_EQUIPE` | Substitui `ZAPI_TELEFONE_EQUIPE` — número da equipe interna (notificação de lead e relatórios) |
| `WHATSAPP_TEMPLATE_CHAMADO_TI` | Nome do template de atualização de chamado TI |
| `WHATSAPP_TEMPLATE_NOVO_LEAD` | Nome do template de notificação de novo lead |
| `WHATSAPP_TEMPLATE_NURTURING_1/2/3` | Nomes dos 3 templates de nutrição (marketing) |
| `WHATSAPP_TEMPLATE_RELATORIO_DIARIO` / `WHATSAPP_TEMPLATE_RELATORIO_SEMANAL` | Nomes dos templates de relatório interno |

Essas duas últimas linhas de templates não estão no `.env.example` ainda
porque os nomes finais só existem depois de criados/aprovados na Meta — some
com os nomes reais assim que forem submetidos.

---

## 3. Templates que precisam ser criados e aprovados na Meta

Cadastro em **Meta Business Manager → WhatsApp Manager → Modelos de
mensagem**. Aprovação costuma levar de minutos a ~1 dia útil, mas pode ser
rejeitado e exigir ajuste de texto — comece isso o quanto antes, é o maior
gargalo depois da verificação de negócio.

> ⚠️ **Nurturing é categoria Marketing.** Diferente dos outros (categoria
> Utility), precisa de **opt-in explícito** do lead para receber mensagens de
> marketing no WhatsApp — não basta ter o telefone dele.
>
> Já implementado: coluna `whatsappOptin` na entidade `Lead` (backend),
> checkbox no formulário de captura (`site-ipessp-frontend` —
> `CTAFinal.tsx` e `fale-conosco/page.tsx`), e o node "Montar Mensagens
> Nurturing" deste fluxo já filtra por esse campo — lead sem opt-in continua
> avançando de etapa normalmente, só não recebe o WhatsApp de marketing.
> **Falta rodar** `documentacao/sql/lead_add_whatsapp_optin.sql` no banco
> (o projeto não usa `synchronize`, é manual) antes de subir o backend.

### `chamado_ti_atualizacao` (Utility, pt_BR, 2 variáveis)
```
Atualização do seu chamado de TI:

Assunto: {{1}}

{{2}}
```

### `notificacao_novo_lead` (Utility, pt_BR, 5 variáveis)
```
🎯 Novo Lead Captado!

Nome: {{1}}
E-mail: {{2}}
Telefone: {{3}}
Interesse: {{4}}
Origem: {{5}}
```

### `nurturing_boas_vindas` / `nurturing_conhecendo` / `nurturing_urgencia` (Marketing, pt_BR, 2 variáveis cada)
```
Olá, {{1}}! 👋 Ficamos felizes com seu interesse no IPESSP, especialmente
no curso de {{2}}! Sou a assistente virtual e estou aqui para tirar suas
dúvidas. Pode me perguntar qualquer coisa! 📚
```
```
{{1}}, vi que você ainda está conhecendo o IPESSP! 🎓 Posso te ajudar com
cursos disponíveis, formas de pagamento e próximas turmas de {{2}}.
Responda aqui ou fale com nossa equipe!
```
```
⏰ {{1}}, as vagas de {{2}} estão preenchendo! Processo seletivo simples,
parcelamento facilitado e certificado reconhecido. Garanta sua vaga:
https://ipessp.edu.br/inscricao
```

### `relatorio_diario_leads` (Utility, pt_BR, 3 variáveis)
```
📊 Relatório Diário — IPESSP

Novos hoje: {{1}}
Interações chatbot: {{2}}
Convertidos: {{3}}
```

### `relatorio_semanal_leads` (Utility, pt_BR, 4 variáveis)
```
📊 Relatório Semanal de Leads — IPESSP

Total geral: {{1}}
Novos este mês: {{2}}
Em nurturing ativo: {{3}}
Taxa de conversão: {{4}}
```
O detalhamento por funil/origem que existia na versão Z-API não entrou no
template (variável de template não é um bom lugar pra lista de tamanho
variável) — quem quiser esse detalhe consulta `GET /v1/admin/leads/funil`
ou o dashboard.

Textos acima são ponto de partida — ajustem o tom antes de submeter para
aprovação se quiserem, só mantenham a contagem de `{{n}}` batendo com os
parâmetros que os nós de código já montam.

---

## 4. Passo a passo até ativar (provedor: 360dialog)

1. Criar conta em https://www.360dialog.com/ e iniciar o onboarding de
   WhatsApp Business Platform pelo painel deles — eles guiam a verificação
   de negócio (CNPJ do IPESSP) junto com a Meta.
2. Registrar o **número novo dedicado** através do onboarding da 360dialog
   (decisão já tomada: número novo, não esperar o chip atual destravar).
3. Pegar no painel da 360dialog: a API key do canal e confirmar a URL base
   de envio. Preencher no `.env` real (não neste `.env.example`):
   - `WHATSAPP_SEND_URL=https://waba-v2.360dialog.io/messages`
   - `WHATSAPP_AUTH_HEADER_NAME=D360-API-KEY`
   - `WHATSAPP_AUTH_HEADER_VALUE=<a API key gerada no painel>`
4. Configurar o webhook no painel da 360dialog apontando para
   `https://<seu-n8n>/webhook/ipessp-whatsapp-meta` — não precisa de
   handshake GET nem de `META_WEBHOOK_VERIFY_TOKEN` (isso só existe no
   caminho Meta direta, que não estamos usando; pode deixar vazio e ignorar
   o nó "Webhook Verificação Meta" nos fluxos).
5. Submeter os templates da seção 3 pelo WhatsApp Manager (o mesmo painel
   da Meta, a 360dialog só dá acesso a ele) e aguardar aprovação — os de
   nurturing já podem ir, opt-in já está implementado no site e no backend.
6. Rodar `documentacao/sql/lead_add_whatsapp_optin.sql` no banco antes de
   subir o backend com as mudanças de opt-in, se ainda não tiver rodado.
7. Importar os 3 fluxos deste diretório no n8n **inativos**, preencher as
   env vars, testar em conversa real com o número novo.
8. Só então: revisar se ativa em paralelo ao Z-API (números diferentes, sem
   conflito) ou substitui de vez — decisão de negócio, não técnica.
