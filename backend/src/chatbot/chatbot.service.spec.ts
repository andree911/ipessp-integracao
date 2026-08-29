import { ChatbotService } from './chatbot.service';
import { ChatbotSessaoStore } from './chatbot-sessao.store';
import {
  BOAS_VINDAS_LEAD,
  CPF_SEM_CADASTRO,
  LEAD_REGISTRADO,
  PEDIR_CPF,
  SAUDACOES,
  SEM_PENDENCIAS,
} from './chatbot.prompts';

const TELEFONE = '5511999999999';
const CPF = '12345678900';

const pendencia = (over: Partial<Record<string, unknown>> = {}) => ({
  codigo: 1,
  descricao: 'Mensalidade de Março',
  vencimento: '2026-03-08',
  valor: 500,
  diasAtraso: 0,
  linhaDigitavel: '34191790010104351004791020150008291070026000',
  codigoPix: '00020126580014BR.GOV.BCB.PIX',
  ...over,
});

function montar() {
  const whatsapp = {
    enviarTexto: jest.fn().mockResolvedValue(undefined),
    enviarImagem: jest.fn().mockResolvedValue(undefined),
  };
  const financeiro = { getByCpf: jest.fn() };
  const ia = {
    getCursos: jest.fn().mockResolvedValue([]),
    getCpfPorTelefone: jest.fn().mockRejectedValue(new Error('sem cadastro')),
    associarTelefoneCpf: jest.fn().mockResolvedValue({ ok: true }),
    encaminharHumano: jest.fn().mockResolvedValue({ ok: true }),
  };
  const modelo = {
    classificar: jest.fn().mockResolvedValue('outro'),
    responder: jest.fn().mockResolvedValue('resposta genérica'),
    responderJson: jest.fn().mockResolvedValue(null),
  };
  const crm = { registrarLead: jest.fn().mockResolvedValue({ ok: true }) };
  const sessoes = new ChatbotSessaoStore();

  const service = new ChatbotService(
    whatsapp as never,
    financeiro as never,
    ia as never,
    modelo as never,
    sessoes,
    crm as never,
  );

  /** Passa a saudação inicial, que é o que o telefone recebe na 1ª mensagem. */
  const saudar = async () => {
    await service.processarMensagem({
      phone: TELEFONE,
      text: { message: 'oi' },
    });
    whatsapp.enviarTexto.mockClear();
  };

  const enviados = () =>
    whatsapp.enviarTexto.mock.calls.map((c: unknown[]) => c[1] as string);

  return { service, whatsapp, financeiro, ia, modelo, crm, saudar, enviados };
}

describe('ChatbotService', () => {
  describe('validação de texto', () => {
    it('não responde nada a mensagem sem texto (figurinha, áudio, imagem)', async () => {
      const { service, whatsapp, modelo } = montar();

      await service.processarMensagem({ phone: TELEFONE, sticker: {} });
      await service.processarMensagem({ phone: TELEFONE, audio: {} });
      await service.processarMensagem({ phone: TELEFONE, image: {} });

      expect(whatsapp.enviarTexto).not.toHaveBeenCalled();
      expect(modelo.classificar).not.toHaveBeenCalled();
    });

    it('aceita o título de uma seleção de lista como texto', async () => {
      const { service, whatsapp, modelo } = montar();

      await service.processarMensagem({
        phone: TELEFONE,
        listResponseMessage: { title: 'Situação financeira' },
      });

      expect(whatsapp.enviarTexto).toHaveBeenCalled();
      // 1ª mensagem do telefone: saudação, sem classificar ainda.
      expect(modelo.classificar).not.toHaveBeenCalled();
    });
  });

  describe('saudação', () => {
    it('responde a primeira mensagem só com a saudação, sem classificar', async () => {
      const { service, modelo, enviados } = montar();

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'bom dia' },
      });

      expect(enviados()).toHaveLength(1);
      expect(SAUDACOES).toContain(enviados()[0]);
      expect(modelo.classificar).not.toHaveBeenCalled();
    });

    it('classifica a partir da segunda mensagem', async () => {
      const { service, modelo, saudar } = montar();
      await saudar();

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero saber dos cursos' },
      });

      expect(modelo.classificar).toHaveBeenCalledWith(
        'quero saber dos cursos',
        null,
      );
    });

    it('passa a trilha anterior pro classificador, pra continuação genérica não reiniciar', async () => {
      const { service, modelo, financeiro, saudar } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana',
        pendencias: [],
      });

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'meu boleto' },
      });
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'sim' },
      });

      expect(modelo.classificar).toHaveBeenLastCalledWith('sim', 'financeiro');
    });
  });

  describe('lead', () => {
    it('abre a triagem com o texto de boas-vindas literal', async () => {
      const { service, modelo, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('lead');

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'não sou aluno, quero saber dos cursos' },
      });

      expect(enviados()).toEqual([BOAS_VINDAS_LEAD]);
      // Nada de modelo redigindo a abertura: ela é fixa.
      expect(modelo.responderJson).not.toHaveBeenCalled();
    });

    it('pede o que falta enquanto os três dados não estiverem completos', async () => {
      const { service, modelo, crm, ia, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('lead');
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero me matricular' },
      });

      modelo.responderJson.mockResolvedValue({
        nome: 'Maria Souza',
        email: null,
        curso: 'Enfermagem',
        resposta: 'Perfeito, Maria! Só falta o seu melhor e-mail.',
      });
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'Maria Souza, enfermagem' },
      });

      expect(enviados()).toContain(
        'Perfeito, Maria! Só falta o seu melhor e-mail.',
      );
      expect(crm.registrarLead).not.toHaveBeenCalled();
      expect(ia.encaminharHumano).not.toHaveBeenCalled();
    });

    it('registra o lead, encaminha pras consultoras e confirma com o texto fixo', async () => {
      const { service, modelo, crm, ia, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('lead');
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero me matricular' },
      });

      modelo.responderJson.mockResolvedValue({
        nome: 'Maria Souza',
        email: 'maria@exemplo.com',
        curso: 'Enfermagem',
        resposta: '',
      });
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'maria@exemplo.com' },
      });

      expect(ia.encaminharHumano).toHaveBeenCalledWith(
        'comercial',
        TELEFONE,
        expect.stringContaining('maria@exemplo.com'),
      );
      expect(crm.registrarLead).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Maria Souza',
          email: 'maria@exemplo.com',
          telefone: TELEFONE,
          cursoInteresse: 'Enfermagem',
        }),
      );
      expect(enviados()).toContain(LEAD_REGISTRADO);
    });

    it('não registra o mesmo lead duas vezes na mesma sessão', async () => {
      const { service, modelo, crm, saudar } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('lead');
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero me matricular' },
      });
      modelo.responderJson.mockResolvedValue({
        nome: 'Maria Souza',
        email: 'maria@exemplo.com',
        curso: 'Enfermagem',
        resposta: '',
      });
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'maria@exemplo.com' },
      });
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'obrigada!' },
      });

      expect(crm.registrarLead).toHaveBeenCalledTimes(1);
    });

    it('não aceita como e-mail um valor que não é e-mail', async () => {
      const { service, modelo, crm, saudar } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('lead');
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero me matricular' },
      });

      modelo.responderJson.mockResolvedValue({
        nome: 'Maria Souza',
        email: 'Enfermagem',
        curso: 'Enfermagem',
        resposta: 'Qual o seu e-mail?',
      });
      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'Maria Souza, enfermagem' },
      });

      expect(crm.registrarLead).not.toHaveBeenCalled();
    });
  });

  describe('financeiro', () => {
    it('pede o CPF quando o telefone não tem nenhum associado', async () => {
      const { service, modelo, financeiro, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero ver meus boletos' },
      });

      expect(enviados()).toEqual([PEDIR_CPF]);
      expect(financeiro.getByCpf).not.toHaveBeenCalled();
    });

    it('reaproveita o CPF já associado ao telefone, sem pedir de novo', async () => {
      const { service, modelo, financeiro, ia, saudar } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      ia.getCpfPorTelefone.mockResolvedValue({ cpf: CPF });
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana',
        pendencias: [],
      });

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero ver meus boletos' },
      });

      expect(financeiro.getByCpf).toHaveBeenCalledWith(CPF);
    });

    it('extrai o CPF formatado da mensagem e o grava depois da consulta dar certo', async () => {
      const { service, modelo, financeiro, ia, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana Lima',
        pendencias: [],
      });

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'meu cpf é 123.456.789-00' },
      });

      expect(financeiro.getByCpf).toHaveBeenCalledWith(CPF);
      expect(ia.associarTelefoneCpf).toHaveBeenCalledWith(
        expect.objectContaining({ telefone: TELEFONE, cpf: CPF }),
      );
      expect(enviados()).toEqual([SEM_PENDENCIAS]);
    });

    it('não gruda no telefone um CPF que não tem cadastro', async () => {
      const { service, modelo, financeiro, ia, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockRejectedValue(new Error('não encontrado'));

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: '123.456.789-00' },
      });

      expect(enviados()).toEqual([CPF_SEM_CADASTRO]);
      expect(ia.associarTelefoneCpf).not.toHaveBeenCalled();
    });

    it('manda linha digitável, PIX copia-e-cola e QR code da parcela escolhida', async () => {
      const { service, modelo, financeiro, whatsapp, saudar, enviados } =
        montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana',
        pendencias: [pendencia()],
      });
      modelo.responderJson.mockResolvedValue({
        codigos: [1],
        resposta: 'Claro, segue a de março:',
      });

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero pagar a de março, cpf 12345678900' },
      });

      const textos = enviados();
      expect(textos).toContain('Claro, segue a de março:');
      expect(textos.some((t) => t.includes('Vencimento: 08/03/2026'))).toBe(
        true,
      );
      expect(
        textos.some((t) =>
          t.includes('34191790010104351004791020150008291070026000'),
        ),
      ).toBe(true);
      expect(
        textos.some((t) => t.includes('00020126580014BR.GOV.BCB.PIX')),
      ).toBe(true);
      expect(whatsapp.enviarImagem).toHaveBeenCalledWith(
        TELEFONE,
        expect.any(String),
        'QR Code PIX',
        'image/png',
      );
    });

    it('manda só a parcela escolhida quando há várias em aberto', async () => {
      const { service, modelo, financeiro, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana',
        pendencias: [
          pendencia(),
          pendencia({
            codigo: 2,
            descricao: 'Mensalidade de Abril',
            vencimento: '2026-04-08',
            codigoPix: 'PIX-ABRIL',
          }),
        ],
      });
      modelo.responderJson.mockResolvedValue({ codigos: [2], resposta: '' });

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'a de abril, cpf 12345678900' },
      });

      const textos = enviados().join('\n');
      expect(textos).toContain('Mensalidade de Abril');
      expect(textos).not.toContain('Mensalidade de Março');
    });

    it('avisa quando a parcela ainda não tem boleto nem PIX emitido', async () => {
      const { service, modelo, financeiro, whatsapp, saudar, enviados } =
        montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana',
        pendencias: [
          pendencia({ linhaDigitavel: undefined, codigoPix: undefined }),
        ],
      });
      modelo.responderJson.mockResolvedValue({ codigos: [1], resposta: '' });

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quero pagar, cpf 12345678900' },
      });

      expect(enviados().join('\n')).toContain('ainda não tem boleto nem PIX');
      expect(whatsapp.enviarImagem).not.toHaveBeenCalled();
    });

    it('lista as parcelas quando o modelo não devolve o JSON esperado', async () => {
      const { service, modelo, financeiro, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('financeiro');
      financeiro.getByCpf.mockResolvedValue({
        nomeAluno: 'Ana',
        pendencias: [pendencia()],
      });
      modelo.responderJson.mockResolvedValue(null);

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'cpf 12345678900' },
      });

      expect(enviados().join('\n')).toContain('Qual delas você quer pagar?');
    });
  });

  describe('demais perguntas', () => {
    it('responde normalmente, com o catálogo de cursos no contexto', async () => {
      const { service, modelo, ia, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockResolvedValue('outro');
      ia.getCursos.mockResolvedValue([
        { nome: 'Enfermagem', duracao: '4 anos', precoMensalidade: 500 },
      ]);
      modelo.responder.mockResolvedValue(
        'A graduação em Enfermagem dura 4 anos.',
      );

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'quanto tempo dura enfermagem?' },
      });

      expect(modelo.responder).toHaveBeenCalledWith(
        expect.stringContaining('Enfermagem'),
        expect.any(Array),
      );
      expect(enviados()).toContain('A graduação em Enfermagem dura 4 anos.');
    });

    it('não deixa a mensagem sem resposta quando o modelo falha', async () => {
      const { service, modelo, saudar, enviados } = montar();
      await saudar();
      modelo.classificar.mockRejectedValue(new Error('API fora do ar'));

      await service.processarMensagem({
        phone: TELEFONE,
        text: { message: 'oi, tudo bem?' },
      });

      expect(enviados()).toHaveLength(1);
    });
  });
});
