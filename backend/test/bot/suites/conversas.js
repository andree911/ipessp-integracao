'use strict';
/**
 * Suíte 3 — Conversas multi-turno: contexto e troca de contexto.
 *
 * É o coração da suíte. Cada cenário roda o fluxo INTEIRO, turno a turno, com o
 * mesmo staticData e o mesmo relógio -- é assim que dá pra afirmar coisas que
 * uma mensagem isolada nunca revelaria: que a conversa não recomeça ao trocar de
 * setor, que o agente sabe o que foi enviado fora dele, e que o histórico não
 * some no meio do caminho.
 *
 * O texto que o modelo escreveria não é simulado. O que se afirma é o que CHEGA
 * até ele: agente roteado, tools em mãos, e o system prompt já resolvido.
 */
const { suite, teste, ok, igual, contem, naoContem, casa, naoCasa } = require('../assert');
const { criarConversa, classificadorPadrao } = require('../conversa');

/**
 * Roteiriza as primeiras respostas do Classificador de Intenção (IA); depois que
 * a fila acaba, cai no stub padrão (continuação genérica reaproveita a categoria
 * anterior). Usado nos cenários em que a mensagem é ambígua de propósito e a
 * decisão do modelo é o que está sendo encenado.
 */
function classificadorFake(respostas = []) {
  const fila = [...respostas];
  return (info) => (fila.length ? fila.shift() : classificadorPadrao(info));
}

module.exports = function conversas({ wf }) {
  suite('Conversa — regressão do incidente real (print do WhatsApp, 13/08 15:42)', () => {
    // Telefone sem CPF no cache: é um interessado, não um aluno.
    const c = criarConversa(wf, { classificarIA: classificadorFake(['secretaria']) });

    teste('1. usuário escolhe "Secretaria" no menu → Agent Secretaria, sem re-saudação', () => {
      const t = c.menu('secretaria', 'Secretaria');
      igual(t.categoria, 'secretaria', 'não roteou pra Secretaria');
      igual(t.agente?.no, 'Agent Secretaria', 'agente errado');
      contem(t.agente.prompt, 'já cumprimentou', 'o agente não foi avisado de que o menu já saudou');
      contem(t.agente.systemMessage, 'Só cumprimente', 'o preâmbulo não traz a regra de saudação única');
    });

    teste('2. "Outro assunto" → segue na Secretaria (continuação genérica)', () => {
      const t = c.texto('Outro assunto');
      igual(t.categoria, 'secretaria', 'continuação genérica deveria manter a categoria anterior');
    });

    teste('3. "pós graduação em farmácia estética" → vira LEAD (era o bug nº 2)', () => {
      const t = c.texto('Gostaria de tirar dúvidas sobre a pós graduação em farmácia estética');
      igual(t.categoria, 'lead_novo', 'curso por nome/nível tinha que virar lead');
      igual(t.agente?.no, 'Agent Leads', 'não caiu no Agent Leads');
    });

    teste('4. o Agent Leads recebe o histórico, não recomeça do zero', () => {
      const t = c.ultimo;
      contem(t.agente.systemMessage, 'VEIO TRANSFERIDA', 'o agente não foi avisado da transferência');
      contem(t.agente.systemMessage, 'não peça nada que a pessoa já tenha informado', 'faltou a regra anti-repergunta');
      igual(t.contexto.setorAnterior, 'secretaria', 'setor anterior não foi propagado');
      contem(t.agente.systemMessage, 'NÃO envie o texto de boas-vindas',
        'ia mandar a saudação de boas-vindas no meio de uma conversa em andamento');
    });

    teste('5. "Não sou aluno" continua no Leads e NÃO é expulso com wa.me (bug nº 3)', () => {
      const t = c.texto('Não sou aluno');
      igual(t.categoria, 'lead_novo', 'declarar não-vínculo tinha que garantir o Leads');
      igual(t.agente?.no, 'Agent Leads', 'voltou pra Secretaria');
      contem(t.agente.systemMessage, 'NUNCA use esses números para quem ainda NÃO é aluno',
        'o preâmbulo não proíbe mandar o interessado embora com telefone');
    });

    teste('6. figurinha de agradecimento é ignorada em silêncio (bug nº 4)', () => {
      const t = c.midia('sticker');
      ok(t.ignorado, 'a figurinha deveria encerrar o ramo sem resposta');
      ok(!t.enviouTexto, 'respondeu a uma figurinha de cortesia');
      igual(t.http.length, 0, 'não deveria ter feito chamada nenhuma');
    });

    teste('7. imagem responde aviso neutro, sem o contato do Financeiro', () => {
      const t = c.midia('image');
      ok(t.enviouTexto, 'não respondeu à imagem');
      const enviada = t.http.find((h) => h.url.includes('/send-text'));
      naoCasa(enviada.body, /99839|financeiro@ipessp/, 'ainda cita o contato do Financeiro fora de contexto');
      casa(enviada.body, /só (consigo ler|entendo)/i, 'a mensagem não explica a limitação');
    });

    teste('8. "É texto mesmo" chega ao agente COM o aviso no contexto (bug nº 5)', () => {
      const t = c.texto('É texto mesmo');
      ok(t.agente, 'a mensagem não chegou em agente nenhum');
      contem(t.agente.systemMessage, 'MENSAGENS AUTOMÁTICAS',
        'o aviso de mídia não foi injetado no contexto — o agente concordaria com uma frase que não disse');
      casa(t.agente.systemMessage, /mídia não suportada/i, 'o texto exato do aviso não chegou ao agente');
    });
  });

  suite('Conversa — troca de contexto entre setores', () => {
    teste('aluno: financeiro → secretaria → financeiro mantém a mesma sessão de memória', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno', nome: 'Maria' } });
      const t1 = c.texto('meu boleto venceu');
      const t2 = c.texto('preciso de uma declaração de matrícula');
      const t3 = c.texto('e o boleto de setembro?');

      igual(t1.agente?.no, 'Agent Financeiro', 'turno 1');
      igual(t2.agente?.no, 'Agent Secretaria', 'turno 2');
      igual(t3.agente?.no, 'Agent Financeiro', 'turno 3');

      // nós de memória diferentes (um por agente) é o desenho do fluxo; o que
      // não pode diferir é a CHAVE de sessão, senão o histórico some na troca
      const memorias = [t1.agente.memoria, t2.agente.memoria, t3.agente.memoria];
      igual(memorias[0], memorias[2], 'o mesmo agente deveria voltar pro mesmo nó de memória');
      ok(memorias[0] !== memorias[1], 'esperava nós de memória distintos entre agentes distintos');

      const chaves = new Set(memorias.map((m) => wf.nodes.find((n) => n.name === m).parameters.sessionKey));
      igual(chaves.size, 1, 'os agentes usam chaves de sessão diferentes — o histórico se perde na troca');
    });

    teste('cada troca de setor avisa o agente novo de onde a conversa veio', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno' } });
      c.texto('meu boleto venceu');
      const t2 = c.texto('preciso de uma declaração de matrícula');
      igual(t2.contexto.setorAnterior, 'financeiro', 'setor anterior errado');
      contem(t2.agente.systemMessage, 'VEIO TRANSFERIDA do atendimento de financeiro', 'faltou o aviso de transferência');
    });

    teste('permanecer no mesmo setor NÃO gera aviso de transferência', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno' } });
      c.texto('meu boleto venceu');
      const t2 = c.texto('quero pagar por pix');
      igual(t2.contexto.setorAnterior, 'financeiro', 'setor anterior');
      naoContem(t2.agente.systemMessage, 'VEIO TRANSFERIDA', 'avisou transferência sem ter trocado de setor');
    });

    teste('lead → TI: assunto novo vence a categoria anterior, sem ficar preso no Leads', () => {
      const c = criarConversa(wf);
      const t1 = c.texto('quais são os cursos');
      const t2 = c.texto('não consigo entrar no portal');
      igual(t1.agente?.no, 'Agent Leads', 'turno 1');
      igual(t2.agente?.no, 'Agent TI', 'palavra-chave de outro setor tem prioridade sobre o sticky de lead');
    });

    teste('"quero fazer a matrícula" continua sendo lead, não financeiro', () => {
      // "matrícul" está na regra de lead_novo, que roda antes da de financeiro:
      // pra quem não é aluno, boleto de matrícula é assunto de matrícula
      const c = criarConversa(wf);
      igual(c.texto('qual o valor do boleto da matrícula?').agente?.no, 'Agent Leads', 'roteou errado');
    });

    teste('professor não cai no financeiro pelo caminho de regex', () => {
      const c = criarConversa(wf, { cpf: { cpf: '99999999900', tipo: 'professor', email: 'prof@ipessp.edu.br' } });
      igual(c.texto('minhas turmas').agente?.no, 'Agent Professor', 'não roteou pro professor');
      ok(c.texto('meu boleto venceu').agente?.no !== 'Agent Financeiro',
        'professor caiu no atendimento financeiro de aluno');
    });

    teste('professor não cai no financeiro pelo caminho do classificador de IA', () => {
      // regressão: "Classificar por Regra" tem as duas checagens de professor,
      // mas a guarda centralizada só tinha trazido uma. Bastava a mensagem ser
      // ambígua o bastante pra chegar no classificador e ser lida como
      // financeiro pro professor ir parar no Agent Financeiro.
      const c = criarConversa(wf, {
        cpf: { cpf: '99999999900', tipo: 'professor' },
        classificarIA: () => 'financeiro',
      });
      const t = c.texto('e sobre aquele pagamento que comentei');
      igual(t.categoria, null, 'a guarda não zerou a categoria vinda do classificador de IA');
      igual(t.agente, null, 'professor chegou num agente de atendimento de aluno');
      ok(t.enviouMenu, 'sem categoria válida, o fluxo deveria reabrir o menu');
    });

    teste('aluno de verdade continua caindo no financeiro pelo classificador de IA', () => {
      const c = criarConversa(wf, {
        cpf: { cpf: '12345678900', tipo: 'aluno' },
        classificarIA: () => 'financeiro',
      });
      igual(c.texto('e sobre aquele assunto que comentei').agente?.no, 'Agent Financeiro',
        'a guarda nova bloqueou quem ela não deveria bloquear');
    });

    teste('avisos e calendário respondem sem agente de IA', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno' } });
      const t = c.texto('tem algum aviso novo?');
      igual(t.categoria, 'avisos', 'categoria');
      igual(t.agente, null, 'avisos não deveria acionar agente de IA');
      ok(t.enviouTexto, 'não respondeu nada');
    });
  });

  suite('Conversa — abertura da triagem de novos alunos', () => {
    teste('lead novo, primeira mensagem: manda o texto de boas-vindas', () => {
      const c = criarConversa(wf);
      const t = c.texto('quais são os cursos');
      contem(t.agente.systemMessage, 'primeira mensagem desta pessoa na triagem',
        'não instruiu a enviar a abertura');
      contem(t.agente.systemMessage, 'Seja muito bem-vindo(a) à Faculdade IPESSP',
        'o texto verbatim da abertura sumiu do prompt');
    });

    teste('mesma pessoa, segunda mensagem: NÃO repete a abertura', () => {
      const c = criarConversa(wf);
      c.texto('quais são os cursos');
      const t = c.texto('me interessa o de estética');
      contem(t.agente.systemMessage, 'JÁ recebeu o texto de boas-vindas', 'ia repetir a saudação da triagem');
    });

    teste('lead chegando transferido: ponte curta em vez de recomeçar', () => {
      const c = criarConversa(wf, { classificarIA: classificadorFake(['secretaria']) });
      c.menu('secretaria', 'Secretaria');
      const t = c.texto('na verdade não sou aluno, queria saber do curso de estética');
      igual(t.agente?.no, 'Agent Leads', 'não transferiu');
      contem(t.agente.systemMessage, 'acabou de ser transferida', 'não instruiu a fazer a ponte');
      naoContem(t.agente.systemMessage, 'primeira mensagem desta pessoa na triagem',
        'ia disparar a saudação de boas-vindas no meio da conversa');
    });

    teste('a abertura volta a valer depois de 12h (TTL da saudação)', () => {
      const c = criarConversa(wf);
      c.texto('quais são os cursos');
      c.esperar(13 * c.relogio.HORA);
      const t = c.texto('queria saber dos cursos de novo'); // sem "oi": saudação abriria o menu
      contem(t.agente.systemMessage, 'primeira mensagem desta pessoa na triagem',
        'conversa nova, dias depois, deveria receber a abertura outra vez');
    });
  });

  suite('Conversa — o Agent Secretaria tem pra onde encaminhar um interessado', () => {
    teste('a tool "Encaminhar para Novos Alunos" chega às mãos do agente', () => {
      const c = criarConversa(wf, { classificarIA: classificadorFake(['secretaria']) });
      const t = c.menu('secretaria', 'Secretaria');
      ok(t.agente.tools.includes('Encaminhar para Novos Alunos'),
        `a Secretaria está sem a tool de novos alunos (tem: ${t.agente.tools.join(', ')})`);
    });

    teste('o prompt manda usar a tool em vez de passar telefone', () => {
      const c = criarConversa(wf, { classificarIA: classificadorFake(['secretaria']) });
      const t = c.menu('secretaria', 'Secretaria');
      contem(t.agente.systemMessage, 'NUNCA passe um telefone ou link wa.me',
        'o prompt ainda permite mandar o interessado embora');
      contem(t.agente.systemMessage, 'Encaminhar para Novos Alunos', 'o prompt não cita a tool');
      naoContem(t.agente.systemMessage, 'encerre essa resposta', 'o beco sem saída antigo continua no prompt');
    });

    teste('cada agente recebe as tools do seu setor', () => {
      const esperado = {
        'Agent Financeiro': ['Consultar Financeiro', 'Enviar Boleto PDF', 'Salvar CPF do Telefone'],
        'Agent Secretaria': ['Consultar Secretaria', 'Encaminhar para Humano (Secretaria)'],
        'Agent TI': ['Abrir Chamado TI', 'Consultar Chamados TI'],
        'Agent Leads': ['Consultar Cursos', 'Registrar Lead CRM', 'Enviar Informativo do Curso'],
        'Agent Professor': ['Consultar Professor', 'Listar Alunos da Disciplina'],
      };
      const ligadas = {};
      for (const [origem, conns] of Object.entries(wf.connections)) {
        for (const ramo of conns.ai_tool || []) for (const c of ramo || []) (ligadas[c.node] ||= []).push(origem);
      }
      for (const [agente, tools] of Object.entries(esperado)) {
        for (const t of tools) {
          ok((ligadas[agente] || []).includes(t), `"${agente}" está sem a tool "${t}"`);
        }
      }
    });
  });

  suite('Conversa — higiene do fluxo', () => {
    teste('mensagem enviada pelo próprio bot (fromMe) é descartada', () => {
      const c = criarConversa(wf);
      const t = c.enviar({ body: { phone: '5519996991300', fromMe: true, text: { message: 'Olá! Sou a Eliza' } } });
      igual(t.agente, null, 'o bot respondeu a si mesmo');
      igual(t.http.length, 0, 'gerou chamada HTTP a partir da própria mensagem');
    });

    teste('saudação abre o menu e registra o envio pro próximo turno', () => {
      const c = criarConversa(wf);
      const t = c.texto('bom dia');
      ok(t.enviouMenu, 'não enviou o menu');
      igual(t.agente, null, 'saudação não deveria acionar agente');
      ok(c.staticData.sessoes?.['5519996991300']?.envios?.length, 'o envio do menu não foi registrado');
    });

    teste('o registro do menu evita a segunda saudação no turno seguinte', () => {
      const c = criarConversa(wf, { classificarIA: classificadorFake(['secretaria']) });
      c.texto('oi');
      const t = c.texto('preciso de uma declaração');
      contem(t.agente.systemMessage, 'JÁ foi cumprimentada', 'o agente não sabe que o menu já saudou');
    });

    teste('o histórico paralelo expira em 30 min e não vaza pra conversa nova', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno' } });
      c.midia('image');
      c.esperar(31 * c.relogio.MINUTO);
      const t = c.texto('preciso de uma declaração');
      naoContem(t.agente.systemMessage, 'MENSAGENS AUTOMÁTICAS',
        'aviso de meia hora atrás ainda está sendo injetado');
    });

    teste('o CPF do cache entra como contexto de sistema, nunca como dado a revelar', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno', nome: 'Maria' } });
      const t = c.texto('meu boleto venceu');
      contem(t.agente.prompt, '[Sistema: CPF: 12345678900', 'o CPF não foi injetado no contexto');
      contem(t.agente.systemMessage, 'nunca confirme, mencione ou mostre esse CPF',
        'o preâmbulo não protege o CPF injetado');
    });

    teste('telefone sem CPF no cache não injeta contexto de sistema', () => {
      const c = criarConversa(wf);
      const t = c.texto('quais são os cursos');
      naoContem(t.agente.prompt, '[Sistema:', 'injetou contexto de CPF pra telefone desconhecido');
    });

    teste('toda resposta de agente passa pela correção de formatação do WhatsApp', () => {
      const c = criarConversa(wf, { cpf: { cpf: '12345678900', tipo: 'aluno' } });
      const t = c.enviar(
        { body: { phone: '5519996991300', fromMe: false, text: { message: 'meu boleto venceu' } } },
        { mocks: { 'Agent Financeiro': 'Seu boleto de **R$ 500** venceu.' } },
      );
      igual(t.respostaFinal, 'Seu boleto de *R$ 5​00,00* venceu.',
        'negrito markdown, centavos e quebra de sequência numérica não foram corrigidos');
    });
  });
};
