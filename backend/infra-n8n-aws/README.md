# n8n na AWS (migrando de Render)

Terraform pra rodar o n8n (serviço + banco) numa VPC isolada dedicada na AWS,
saindo do Render. Não mexe no backend NestJS (`integracao-service`, que
continua no Render) nem em nada mais da conta AWS — rede própria, do zero,
pra não arriscar interferir no que já está rodando lá.

**Arquitetura:** VPC dedicada → ECS Fargate (container oficial `n8nio/n8n`)
→ RDS Postgres (managed, backup automático) → ALB → CloudFront (só pra
ganhar HTTPS grátis em `*.cloudfront.net`, sem precisar decidir domínio
próprio agora — dá pra trocar depois, ver comentário em `cloudfront.tf`).

**Custo aproximado:** bem mais caro que o plano Render atual — Fargate
(~US$9-15/mês no tamanho default), RDS db.t4g.micro (~US$12-15/mês +
storage), ALB (~US$16/mês fixo + tráfego), CloudFront (baixo, tráfego
pequeno). Total na faixa de US$40-55/mês. Confirmem que essa migração é
sobre confiabilidade/controle, não economia — se for sobre economia, vale
reconsiderar antes de aplicar.

---

## 0. Pré-requisitos

- AWS CLI configurado localmente com credenciais que tenham permissão de
  criar VPC/RDS/ECS/IAM/Secrets Manager/CloudFront/S3/DynamoDB nessa conta.
- Terraform >= 1.5 instalado.
- Confirmado com vocês: o banco do n8n atual no Render não tem nada
  relevante pra preservar (sem histórico de execução/lead que importe), então
  esta migração **não faz backup/restore de dados** — sobe um banco novo
  vazio e reimporta só a *definição* dos workflows (os arquivos `.json` de
  `docs/`, que já são versionados aqui). Se isso mudar antes de aplicar,
  avisem antes do passo 4 — nesse caso precisaríamos voltar a fazer
  `pg_dump`/`pg_restore` do Postgres do Render.
- Anotar, do painel do Render (serviço n8n atual): versão do n8n rodando
  (rodapé da UI) — usar a mesma versão em `n8n_image` evita qualquer
  diferença de comportamento entre o export antigo e o import novo.

---

## 1. Bootstrap do state remoto (uma vez só)

```bash
cd bootstrap
terraform init
terraform apply
terraform output backend_config_snippet
```

Copia o output pra `../backend.tf` (substitui os dois `PREENCHER-APOS-BOOTSTRAP`).

## 2. Preencher variáveis

```bash
cd ..
cp terraform.tfvars.example terraform.tfvars
```

Preenche `terraform.tfvars` com os valores reais (ver comentários no próprio
arquivo). **Confirme que `terraform.tfvars` está no `.gitignore`** antes de
prosseguir — já deixei a entrada lá, mas vale checar (`git check-ignore -v
infra-n8n-aws/terraform.tfvars`).

## 3. Aplicar a infra

```bash
terraform init
terraform plan   # revisa antes de aplicar, principalmente RDS e IAM
terraform apply
```

Isso sobe o n8n **do zero**, com um banco novo vazio — ainda não tem nenhum
workflow, nem usuário criado. Não aponte nenhum webhook externo pra cá ainda.

Acompanhe os logs em CloudWatch (`terraform output cloudwatch_log_group`) até
o container subir saudável, e confirme `GET <n8n_url>/healthz` respondendo
200 antes de seguir.

## 4. Configurar o n8n novo (sem migração de dados)

Abrir `terraform output n8n_url` no navegador — primeira vez vai pedir pra
criar o usuário owner do n8n (email/senha, é local dessa instância, não tem
relação com o Render).

Depois de logado:

1. **Reimportar os 4 workflows** — n8n UI → Workflows → Import from File →
   selecionar cada `.json` de `../docs/` (`Bot-IPESSP-WhatsApp.json`,
   `CRM-IPESSP-Leads-completo.json`, `Notificação-chamado-TI.json`,
   `Keep-alive-backend.json`). O JSON exportado não traz segredo nenhum de
   credencial (Client-Token, API key etc. — isso já vem das env vars via
   `$env.*`, que o Terraform já configurou a partir de `terraform.tfvars`).
2. **Recriar a credencial "OpenAI account"** usada pelo nó `OpenAI Chat
   Model` do `Bot IPESSP WhatsApp` — essa é uma credencial de verdade do n8n
   (não env var), fica salva criptografada no banco e por isso não vem no
   export. n8n UI → Credentials → New → OpenAI, colar a API key, e depois
   reabrir o workflow do bot e reapontar o nó pra essa credencial nova (o
   import às vezes perde a referência).
3. Conferir em cada um dos 4 workflows que as env vars resolvem certo —
   n8n UI → Settings → Variables não existe no self-hosted; é tudo via
   `$env.NOME` mesmo, então basta abrir um nó (ex. "Enviar Resposta
   WhatsApp") e checar que o preview da expressão não mostra `undefined`.

**Nesse ponto os fluxos devem ficar INATIVOS** no n8n novo até o corte — não
desative os do Render ainda, pra não ficar sem bot no ar entre um passo e
outro.

## 5. Corte (cutover) — trocar quem recebe os webhooks

Só depois de validar o passo 4 (workflows importados, credencial OpenAI
recriada, nenhuma expressão `$env.*` aparecendo `undefined`). Nessa ordem,
pra minimizar janela de inconsistência:

1. **Desativar** os 4 fluxos no n8n do **Render** (Bot, CRM, Notificação TI,
   Keep-alive).
2. **Ativar** os mesmos fluxos no n8n **novo (AWS)**.
3. Atualizar as URLs externas que apontam pro n8n:
   - **Supabase → Database Webhooks** — trocar a URL do webhook que dispara
     `Notificação Chamado TI` pra `<n8n_url>/webhook/notificacao-chamado-ti`.
   - **Backend (Render, `integracao-service`) → env var `N8N_LEADS_WEBHOOK_URL`**
     — trocar pra `<n8n_url>/webhook/ipessp-crm-leads` e redeployar o backend
     (ou usar "Manual Deploy" no painel, não precisa rebuild de código).
   - **Z-API** (painel deles, enquanto `docs/` ainda estiver ativo) — trocar
     a URL do webhook de mensagens recebidas pra apontar pro n8n novo.
4. Mandar uma mensagem de teste real pro WhatsApp do bot e confirmar resposta.
5. Conferir `GET <n8n_url>/healthz` e o Keep-alive rodando.

Se algo quebrar, reverter é só inverter os passos 1-3 (reativar no Render,
desativar no AWS, apontar URLs de volta) — por isso o Render **não deve ser
desligado** nesse momento.

## 6. Decomissionar o Render (só depois de alguns dias estável)

Depois de confirmar que o n8n novo está estável em produção por um tempo
(sugestão: pelo menos 1 semana, cobrindo o ciclo de nurturing/relatórios
semanais inteiro):

- Apagar o serviço n8n no Render.
- Apagar o Postgres do n8n no Render.
- Atualizar `documentacao/BACKEND.md` (seção de arquitetura/deploy) pra
  refletir o n8n na AWS.

---

## Quando o 360dialog entrar (ver `../docs-meta/README.md`)

Configurem o webhook do 360dialog **direto pro n8n novo** (`<n8n_url>/webhook/ipessp-whatsapp-meta`),
não pro Render — evita configurar duas vezes. Se a migração AWS ainda não
tiver terminado quando o 360dialog estiver pronto, tudo bem apontar pro
Render primeiro e trocar depois, só não esqueçam desse passo no cutover.
