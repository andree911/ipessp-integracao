# Roteiro de teste — Bot IPESSP WhatsApp (roteado)

Como testar: mande as mensagens de cada bloco em ordem, num número de teste (não no WhatsApp de produção), esperando a resposta antes de mandar a próxima. Em cada resposta, confira:

- Foi pro assunto certo (não misturou financeiro com secretaria, cursos com CRM etc.)
- Não apareceu jargão interno: "CRM", "lead", "já cadastrado", código/ID solto
- Tom e formatação batem com o esperado (negrito com `*um*` asterisco, sem markdown de verdade)

Se tiver acesso ao editor do n8n, dá pra conferir também o campo `categoria` que sai do node **Classificar por Regra** / **Interpretar Categoria IA** em cada execução — mais rápido que só olhar a resposta final.

---

## 1. Financeiro
1. `boa noite` → deve mandar o menu de opções
2. `quero saber meus boletos` → deve pedir CPF (se o telefone de teste não tiver CPF salvo)
3. `<CPF de teste>` → deve listar pendências reais ou dizer que não encontrou, sem inventar
4. `posso pagar pelo portal?` → só deve mencionar portalLink se ele vier preenchido na resposta da tool
5. `manda o boleto em pdf` → deve chamar "Enviar Boleto PDF" e confirmar com frase curta

## 2. Lead novo / matrícula — **inclui o caso que quebrou**
1. `quero me matricular`
2. `quais cursos vocês têm` (ou o nome de um curso específico)
3. `liste todos os cursos` ← **mensagem genérica de continuação, é o caso do bug corrigido**. Deve continuar em `lead_novo` e realmente listar os cursos via tool, não dizer "não tenho acesso"
4. Responder com nome completo e email
5. `sim` (opt-in de WhatsApp)

Esperado: nunca menciona CRM/lead pro usuário, sempre trata como se fosse a primeira conversa, termina com a frase fixa exata "✅ Seus dados foram registrados! Em breve nossa equipe entrará em contato." — sem parafrasear.

## 3. Secretaria
1. `preciso de uma declaração de matrícula`
2. Informar CPF se pedir

**Edge case**: nesse mesmo fluxo, mandar `na verdade eu não sou aluno, quero saber dos cursos` — deve trocar pra `lead_novo`, não insistir em Secretaria.

## 4. TI
1. `esqueci minha senha`
2. `não consigo entrar no teams`

Esperado: dá as orientações antes de abrir chamado; só usa "Abrir Chamado TI" se elas não resolverem.

## 5. Avisos (sem LLM, é só busca + formatação)
1. `tem algum aviso?`

Esperado: lista os avisos ativos reais, ou diz que não há nenhum — sem alucinar.

## 6. Calendário (sem LLM)
1. `quais as próximas datas do calendário?`

## 7. Professor
Precisa que o telefone de teste já esteja com `tipo: professor` salvo no cache (senão a regra de roteamento bloqueia essa categoria de propósito). Se não tiver, pule esse bloco por ora.
1. `quais são minhas disciplinas?`
2. Pedir a lista de alunos de uma delas

## 8. Ambíguo / fallback
1. `oi` → menu
2. `kkkk valeu, muito bom` → não deve alucinar uma resposta fora de contexto; comportamento aceitável é cair em `outro` e reapresentar o menu

## 9. Troca de assunto no meio da conversa (sticky não pode "prender" o usuário)
1. Iniciar um fluxo financeiro: `quero ver meus boletos`
2. No meio, mandar: `na verdade quero saber sobre os cursos que vocês oferecem`
3. Deve trocar pra `lead_novo` nessa mesma mensagem (regex forte sempre sobrepõe a categoria anterior/sticky)

## 10. Bloqueio financeiro para professor
Com o telefone marcado como `tipo: professor`:
1. `quero ver meus boletos` → não deve cair em Financeiro; deve explicar que esse atendimento é só pra alunos e indicar o contato certo
