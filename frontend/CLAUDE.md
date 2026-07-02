@AGENTS.md

# Site institucional IPESSP (frontend)

Site institucional + formulários públicos do IPESSP (Instituto de Pesquisa e Educação em Saúde de São Paulo), incluindo o fluxo de solicitação de matrícula. Consome a API do backend NestJS do projeto irmão `integracao-sophia-n8n` (documentado em `../integracao-sophia-n8n/documentacao/BACKEND.md`) — nunca fala com o Sophia ou com o Mercado Pago diretamente.

---

## Stack

- **Next.js 16** (App Router, tudo em `app/`, sem `pages/`), React 19, TypeScript, Tailwind CSS 4.
- **Sem libs de formulário/validação/HTTP**: nada de react-hook-form, zod, axios, swr ou react-query. Todo formulário é `useState` + `fetch` nativo, com validação manual (CPF validado só em `app/matricula`, ver abaixo).
- Alias `@/*` aponta pra raiz do projeto (ex.: `@/lib/contato`).

---

## Como o site fala com o backend

Dois padrões coexistem, dependendo se o endpoint exige uma API key secreta:

### 1. Proxy via rota local (`app/api/*`) — para endpoints com Bearer token

Usado só onde o backend exige `Authorization: Bearer <token>` (pra não expor a chave no browser):

| Rota local | Backend | Variável de ambiente da chave |
|---|---|---|
| `POST /api/matriculas` | `POST {API_URL}/v1/matriculas` | `MATRICULAS_API_KEY` |
| `POST /api/lead` | `POST {API_URL}/v1/leads` | `LEADS_API_KEY` |

Ambas são proxies burros (`app/api/matriculas/route.ts`, `app/api/lead/route.ts`): recebem o JSON do cliente, repassam verbatim pro backend com o header `Authorization` injetado no servidor, e devolvem a resposta (status + body) sem transformar nada. Se a env var da chave não estiver setada, respondem `503` direto (não chegam a chamar o backend).

### 2. Chamada direta do browser (`apiFetch`) — para endpoints públicos

`app/lib/api.ts` expõe `apiFetch(path, init)`, que chama `${NEXT_PUBLIC_API_URL}${path}` direto do navegador, com `credentials: 'include'` e `Content-Type: application/json` automático (exceto quando o body é `FormData`, pra upload de arquivo funcionar). Usado por: `/v1/candidaturas`, `/v1/mensagens-contato`, `/v1/manifestacoes`, `/v1/solicitacoes-eventos` — nenhum desses exige Bearer token no backend.

---

## Fluxo de matrícula (`app/matricula/page.tsx`) — o mais importante

Wizard de 4 passos num único arquivo (`STEPS = ['Aluno', 'Responsável', 'Curso', 'Pagamento']`), sem sub-componentes:

1. **Aluno**: `nome, cpf, email, telefone, sexo ('M'|'F'), dataNascimento`
2. **Responsável** (só se o checkbox "responsável financeiro diferente do aluno" estiver marcado): `nome, cpf, email, telefone, tipoParentesco ('1'=Mãe,'2'=Pai,'3'=Outro)`
3. **Curso**: `curso, unidade, turno ('Manhã'|'Tarde'|'Noite'|'Integral'), periodoLetivo, curriculo`
4. **Plano de pagamento**: `numeroParcelas, valorParcela, dataPrimeiraParcela, desconto`

CPF é mascarado e validado por checksum (`maskCPF`/`validarCPF`, topo do arquivo) — é o único formulário do site com essa validação.

`handleSubmit` monta o payload e faz `POST /api/matriculas` (rota local, **não** chama o backend direto):

```ts
{
  aluno: { nome, cpf /* só dígitos */, email?, telefone? /* só dígitos */, sexo, dataNascimento? },
  curso: { curso, unidade, turno, periodoLetivo, curriculo? },
  planoPagamento: { numeroParcelas: number, valorParcela: number, dataPrimeiraParcela, desconto? },
  responsavel?: { nome, cpf, email?, telefone?, tipoParentesco: number }, // só se marcado
}
```

Esse payload bate exatamente com `SolicitarMatriculaDto` do backend (`integracao-sophia-n8n/src/matriculas/dto/solicitar-matricula.dto.ts`) — qualquer mudança de um lado precisa espelhar no outro.

A resposta esperada é `{ codigoAluno, pagamento: { linkPagamento, linkSandbox } | null }`. Em caso de sucesso, a tela final mostra o link de pagamento do Mercado Pago pro aluno (a 1ª parcela é cobrada ali — ver `BACKEND.md` do outro projeto pra entender por que o Sophia não é chamado diretamente neste momento).

---

## Outros formulários que falam com o backend

| Página | Endpoint | Payload | Observação |
|---|---|---|---|
| `app/trabalhe-conosco` | `POST /v1/candidaturas` | `FormData: nome, email, area, mensagem?, file?` (PDF/Word, máx. 2MB) | Multipart — `apiFetch` detecta `FormData` e não força `Content-Type` |
| `app/fale-conosco` | `POST /v1/mensagens-contato` | `{ nome, email, telefone, assunto, mensagem }` | Depois do sucesso, dispara **fire-and-forget** `POST /api/lead` (`{ nome, email, telefone, observacao, origem: 'site' }`) — erro nessa segunda chamada é engolido (`.catch(() => {})`) e nunca aparece pro usuário |
| `app/ouvidoria` | `POST /v1/manifestacoes` | `{ nome, email, tipo, mensagem }` | — |
| `app/espaco-para-eventos` | `POST /v1/solicitacoes-eventos` | `{ nome, email, telefone, tipoEvento, descricao }` | — |
| `app/diplomas` | `POST /v1/mensagens-contato` | `{ nome, email, assunto: "Solicitação de diploma/certificado: ...", mensagem: "..." }` | **Reaproveita** o endpoint de contato — não existe endpoint dedicado de diploma no backend |
| `app/components/CTAFinal.tsx` (home) | `POST /api/lead` → `/v1/leads` | `{ nome, email, telefone, cursoInteresse, origem: 'site' }` | Captura de lead na home |

---

## Variáveis de ambiente

Não existe `.env`/`.env.example` no repo — precisam ser configuradas externamente (ex.: settings do projeto na Vercel).

| Variável | Uso | Exposta ao browser? |
|---|---|---|
| `API_URL` | Base do backend, usada pelas rotas proxy (`app/api/matriculas`, `app/api/lead`) | Não |
| `MATRICULAS_API_KEY` | Bearer token injetado em `POST /v1/matriculas` | Não (segredo) |
| `LEADS_API_KEY` | Bearer token injetado em `POST /v1/leads` | Não (segredo) |
| `NEXT_PUBLIC_API_URL` | Base do backend pras chamadas diretas do browser (`apiFetch`) | Sim |
| `NEXT_PUBLIC_EDITAL_URL` | Link do edital no componente `ProcessoSeletivo` | Sim |
| `NEXT_PUBLIC_SOPHIA_PORTAL_URL` | Link do Portal do Aluno Sophia (`lib/contato.ts`, com validação de esquema contra `javascript:`/`data:`) | Sim |

---

## Pontos de atenção pra quem for mexer

- **`app/diplomas` não tem endpoint próprio no backend** — se um dia precisar tratar solicitação de diploma de forma diferente de mensagem de contato genérica, vai precisar criar o endpoint lá antes.
- **Falha ao criar lead em `fale-conosco` é silenciosa** — se `POST /api/lead` falhar depois do contato ser enviado com sucesso, ninguém percebe (nem o usuário, nem log visível no frontend). Se leads perdidos desse formulário virarem um problema, essa é a causa mais provável.
- **Nenhum formulário além de `matricula` valida CPF/e-mail no cliente** — a validação de fato acontece nos DTOs (`class-validator`) do backend; erros só aparecem depois do POST.
- Se o **fluxo de matrícula automatizada no Sophia** (ver `BACKEND.md` do backend) mudar o formato de resposta do `POST /v1/matriculas`, a tela de confirmação em `app/matricula/page.tsx` (que hoje só espera `{ codigoAluno, pagamento }`) provavelmente vai precisar de ajuste.
