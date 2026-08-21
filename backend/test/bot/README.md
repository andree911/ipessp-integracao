# Suíte de testes do chatbot (Bot IPESSP WhatsApp)

Roda o fluxo do n8n fora do n8n, pra pegar antes do usuário os erros de
roteamento e de contexto que só apareciam em conversa real.

```bash
npm run test:bot          # tudo que é determinístico — sem rede, sem dependência
npm run test:bot:ia       # + o Classificador de Intenção chamando a API de verdade
```

Outras formas:

```bash
node test/bot/run.js --workflow ../../ipessp-sistema/core/n8n/Bot-IPESSP-WhatsApp.json
BOT_TEST_STACK=1 node test/bot/run.js     # stack trace nas falhas
```

O código dos nós **não é copiado** pra cá: cada suíte lê o
`n8n/Bot-IPESSP-WhatsApp.roteado.json` e executa o `jsCode`/`systemMessage` que
está lá dentro. Editou o fluxo no n8n e reexportou por cima do JSON? A suíte
testa a versão nova, sem passo intermediário.

## O que cada suíte cobre

| Suíte | Arquivo | Pergunta que responde |
|---|---|---|
| Contratos | `suites/contratos.js` | Toda tool aponta pra rota que existe mesmo nos controllers? Manda o header de auth certo? |
| Estrutura | `suites/contratos.js` | Sobrou nó órfão? Agente sem memória/modelo? Tool solta, ligada a ninguém? |
| Memória | `suites/contratos.js` | Os 5 agentes compartilham a mesma chave de sessão, com janela suficiente? |
| Sincronia | `suites/contratos.js` | As duas cópias do workflow (integração e core) continuam idênticas? |
| Classificação | `suites/classificacao.js` | Cada mensagem cai na categoria certa — incluindo as que falharam em produção |
| Conversas | `suites/conversas.js` | **Contexto e troca de contexto**, turno a turno |
| Classificador (IA) | `suites/classificador-ia.js` | O modelo obedece mesmo o system prompt? (opcional, `--ia`) |

## Como os testes de contexto funcionam

`conversa.js` mantém, entre os turnos, o mesmo `staticData` e o mesmo relógio.
É isso que permite afirmar coisas que uma mensagem isolada nunca revelaria:

```js
const c = criarConversa(wf, { cpf: { cpf: '123…', tipo: 'aluno' } });
c.texto('meu boleto venceu');                       // → Agent Financeiro
const t = c.texto('preciso de uma declaração');     // → Agent Secretaria

t.contexto.setorAnterior;    // 'financeiro'
t.agente.systemMessage;      // já contém o aviso de transferência
t.agente.tools;              // as tools que o agente tinha em mãos
```

O relógio é injetável, então TTL é testável de verdade:

```js
c.midia('image');                      // dispara o aviso de "só leio texto"
c.esperar(31 * c.relogio.MINUTO);      // passa do TTL do histórico paralelo
c.texto('preciso de uma declaração');  // o aviso não deve mais aparecer no contexto
```

## O que NÃO é simulado

**A resposta dos agentes.** Nenhum teste afirma o texto que a Eliza escreveria —
isso exigiria chamar o modelo a cada turno, sairia caro e seria instável.

O que a suíte afirma é o que **chega até o modelo**: qual agente foi roteado,
quais tools ele tinha, e o system prompt já resolvido (preâmbulo, aviso de
transferência, histórico paralelo, instrução de boas-vindas). Isso não é um
consolo: dos cinco erros do incidente de 13/08, quatro estavam exatamente aí —
a informação nunca chegava ao modelo. Só o quinto (a lista que virou botão)
dependia de como o modelo escreveu.

O único ponto do roteamento que depende do modelo é o `Classificador de Intenção
(IA)`, e por isso ele tem a suíte `--ia` própria, que manda o system prompt do
JSON pra API e confere a categoria devolvida. Precisa de `ANTHROPIC_API_KEY`;
são respostas de uma palavra, custa centavos. Nas outras suítes esse nó é
simulado por um stub que segue a regra documentada no próprio prompt
(continuação genérica reaproveita a categoria anterior) — e é a suíte `--ia` que
verifica se o modelo realmente segue essa regra.

## Limitações do mini-runtime

`runtime.js` implementa só o que este fluxo usa: expressões `{{ }}`, nós `code`,
`if` com os operadores string `equals`/`exists`/`regex`, e mocks pros nós HTTP e
de agente. Acesso a propriedade de `undefined` devolve `undefined`, como no motor
do n8n — o `If1` depende disso pra detectar mensagem sem texto.

Nó novo de um tipo não suportado faz a suíte parar com erro explícito em vez de
passar batido. Se isso acontecer, o lugar de ensinar o tipo novo é o `switch` de
`executarTurno`.

## Achados

Bugs que saíram de escrever e manter esta suíte, todos já corrigidos:

- `Aplicar Guarda de Categoria` só tinha metade da regra de professor. O caminho
  de regex impedia professor de cair no financeiro; o caminho do classificador de
  IA, não — bastava a mensagem ser ambígua o suficiente pro professor ir parar no
  Agent Financeiro, que consultaria boleto com o CPF dele.
- O regex de curso pegava "saber **sobre** os cursos" mas não "saber **dos**
  cursos".
- Ao consolidar os quatro caches paralelos de `staticData` num único
  `sessoes[telefone]`, dividir o preâmbulo em "Carregar Sessão do Telefone"
  (estado) + "Montar Preâmbulo" (texto puro) introduziu uma ordem
  leitura-antes-de-escrever errada: o nó de sessão lia `sessao.categoria`
  DEPOIS de "Aplicar Guarda de Categoria" já ter escrito a categoria deste
  mesmo turno, então toda conversa parecia "transferida de outro setor" já
  na primeira mensagem. A suíte pegou isso na hora (8 testes vermelhos) antes
  de qualquer commit — corrigido levando um snapshot do valor anterior no
  próprio item, tirado no instante exato antes da escrita.

## Teste da própria suíte

```bash
npm run test:bot:mutacao
```

Desfaz uma correção por vez, numa cópia temporária do workflow, e confere que a
suíte fica vermelha. São 14 mutações — uma por correção do incidente, mais
tool com rota quebrada e nó órfão.

Se alguma virar `PASSOU`, ou a correção sumiu do fluxo ou o teste que a cobria
virou decorativo. Vale rodar depois de mexer no workflow.
