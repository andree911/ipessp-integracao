import { Injectable, Logger } from '@nestjs/common';
import * as QRCode from 'qrcode';
import { WhatsAppService } from '../email/whatsapp.service';
import { FinanceiroService } from '../financeiro/financeiro.service';
import { IaService } from '../ia/ia.service';
import { errMsg } from '../common/err.util';
import { maskTelefone } from '../common/mask.util';
import { ChatbotIaService } from './chatbot-ia.service';
import { ChatbotSessaoStore, SessaoChatbot } from './chatbot-sessao.store';
import { CrmService } from './crm.service';
import {
  BOAS_VINDAS_LEAD,
  CPF_SEM_CADASTRO,
  ERRO_GENERICO,
  LEAD_REGISTRADO,
  PEDIR_CPF,
  PROMPT_FINANCEIRO,
  PROMPT_LEAD,
  PROMPT_OUTRO,
  SAUDACOES,
  SEM_PENDENCIAS,
  Trilha,
} from './chatbot.prompts';

/** Recorte do payload da Z-API que o chatbot usa. O resto passa direto. */
export interface MensagemRecebida {
  phone?: string;
  senderName?: string;
  text?: { message?: string };
  listResponseMessage?: { title?: string };
  [key: string]: unknown;
}

interface RespostaLead {
  nome?: string | null;
  email?: string | null;
  curso?: string | null;
  resposta?: string;
}

interface RespostaFinanceiro {
  codigos?: number[];
  resposta?: string;
}

interface Pendencia {
  codigo: number;
  descricao: string;
  vencimento: string;
  valor: number;
  linhaDigitavel?: string;
  codigoPix?: string;
}

const CPF_RE = /(\d{3}\D?\d{3}\D?\d{3}\D?\d{2})/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const sortear = (opcoes: string[]) =>
  opcoes[Math.floor(Math.random() * opcoes.length)];

const formatarReal = (valor: number) =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatarData = (iso: string) => {
  const [ano, mes, dia] = iso.substring(0, 10).split('-');
  return dia && mes && ano ? `${dia}/${mes}/${ano}` : iso;
};

/**
 * Chatbot de atendimento por WhatsApp, rodando inteiro no backend.
 *
 * Porta a parte do fluxo n8n `Bot-IPESSP-WhatsApp.roteado.json` que este
 * projeto atende hoje — triagem de lead e financeiro do aluno — para código,
 * pelos mesmos motivos que levaram o webhook da Z-API pra cá em 2026-08-14:
 * o que o usuário recebe passa a ser testável (`chatbot.service.spec.ts`) e
 * deixa de depender de um workflow editado por fora do repositório.
 *
 * A diferença de arquitetura em relação ao n8n é deliberada: lá o modelo era
 * um AI Agent com tools, e decidia por conta própria quando registrar um
 * lead, consultar o financeiro ou mandar um boleto. Aqui o modelo só
 * classifica e redige — quem busca dado e executa ação (registrar lead,
 * avisar consultora, gerar QR code) é este serviço. Ação de efeito externo
 * nunca fica na mão do modelo, e o texto das promessas concretas
 * (confirmação de lead) é fixo, não gerado.
 */
@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);

  constructor(
    private readonly whatsapp: WhatsAppService,
    private readonly financeiro: FinanceiroService,
    private readonly ia: IaService,
    private readonly modelo: ChatbotIaService,
    private readonly sessoes: ChatbotSessaoStore,
    private readonly crm: CrmService,
  ) {}

  async processarMensagem(payload: MensagemRecebida): Promise<void> {
    const telefone = payload.phone;
    if (!telefone) return;

    // Validação de texto: figurinha, reação, áudio, imagem, documento e
    // localização saem daqui em silêncio. A seleção de item de lista entra
    // pelo título, que é texto de verdade escrito por nós.
    const mensagem = (
      payload.text?.message ??
      payload.listResponseMessage?.title ??
      ''
    ).trim();
    if (!mensagem) return;

    const sessao = this.sessoes.obter(telefone);

    // Saudação: primeira mensagem do telefone (ou primeira depois do TTL).
    // Encerra o turno sem classificar — a mensagem que vale pra roteamento é
    // a próxima, exatamente como no fluxo n8n, onde a saudação só abria o menu.
    if (!sessao.saudada) {
      sessao.saudada = true;
      await this.enviar(sessao, telefone, sortear(SAUDACOES));
      return;
    }

    this.sessoes.registrarTurno(sessao, 'user', mensagem);

    try {
      const trilha = await this.modelo.classificar(mensagem, sessao.trilha);
      sessao.trilha = trilha;
      this.logger.log(
        `Mensagem de ${maskTelefone(telefone)} classificada como "${trilha}"`,
      );
      await this.rotear(trilha, telefone, mensagem, sessao);
    } catch (err: unknown) {
      this.logger.error(
        `Falha ao processar mensagem de ${maskTelefone(telefone)}: ${errMsg(err)}`,
      );
      await this.enviar(sessao, telefone, ERRO_GENERICO);
    }
  }

  private async rotear(
    trilha: Trilha,
    telefone: string,
    mensagem: string,
    sessao: SessaoChatbot,
  ): Promise<void> {
    if (trilha === 'lead') return this.atenderLead(telefone, sessao);
    if (trilha === 'financeiro')
      return this.atenderFinanceiro(telefone, mensagem, sessao);
    return this.atenderOutro(telefone, sessao);
  }

  // --- Lead ---------------------------------------------------------------

  private async atenderLead(
    telefone: string,
    sessao: SessaoChatbot,
  ): Promise<void> {
    // Abertura da triagem: texto fixo, uma vez por sessão. Só depois dela é
    // que faz sentido pedir ao modelo pra extrair nome/e-mail/curso — antes
    // não há o que extrair, e a pergunta pelos três dados precisa sair
    // literal, sem paráfrase.
    if (!sessao.leadSaudado) {
      sessao.leadSaudado = true;
      await this.enviar(sessao, telefone, BOAS_VINDAS_LEAD);
      return;
    }

    if (sessao.leadRegistrado) {
      await this.atenderOutro(telefone, sessao);
      return;
    }

    const catalogo = await this.catalogoCursos();
    const dados = await this.modelo.responderJson<RespostaLead>(
      `${PROMPT_LEAD}\n\n${catalogo}`,
      sessao.historico,
    );

    const nome = dados?.nome?.trim() || null;
    const email = dados?.email?.trim() || null;
    const curso = dados?.curso?.trim() || null;

    // O e-mail é revalidado aqui porque é o dado que a consultora usa pra
    // retomar o contato: o modelo já devolveu "email" com um nome de curso
    // dentro quando a pessoa respondeu tudo numa linha só.
    const completo = !!(nome && curso && email && EMAIL_RE.test(email));
    if (!completo) {
      await this.enviar(
        sessao,
        telefone,
        dados?.resposta?.trim() || BOAS_VINDAS_LEAD,
      );
      return;
    }

    sessao.leadRegistrado = true;
    await this.registrarEEncaminhar(telefone, {
      nome,
      email,
      curso,
    });
    await this.enviar(sessao, telefone, LEAD_REGISTRADO);
  }

  /**
   * O aviso às consultoras vem antes do registro no CRM de propósito: é ele
   * que garante o atendimento humano. Se o core estiver fora do ar, perde-se
   * a linha no CRM, não o lead.
   */
  private async registrarEEncaminhar(
    telefone: string,
    lead: { nome: string; email: string; curso: string },
  ): Promise<void> {
    const resumo =
      `Novo interessado pelo chatbot.\n` +
      `Nome: ${lead.nome}\nE-mail: ${lead.email}\nCurso de interesse: ${lead.curso}`;

    try {
      await this.ia.encaminharHumano('comercial', telefone, resumo);
    } catch (err: unknown) {
      this.logger.error(
        `Falha ao encaminhar lead ${maskTelefone(telefone)} pras consultoras: ${errMsg(err)}`,
      );
    }

    await this.crm.registrarLead({
      nome: lead.nome,
      email: lead.email,
      telefone,
      cursoInteresse: lead.curso,
      observacao: 'Lead captado pelo chatbot de WhatsApp.',
    });
  }

  // --- Financeiro ---------------------------------------------------------

  private async atenderFinanceiro(
    telefone: string,
    mensagem: string,
    sessao: SessaoChatbot,
  ): Promise<void> {
    const cpf = await this.resolverCpf(telefone, mensagem, sessao);
    if (!cpf) {
      await this.enviar(sessao, telefone, PEDIR_CPF);
      return;
    }

    let pendencias: Pendencia[];
    let nomeAluno: string;
    try {
      const dados = await this.financeiro.getByCpf(cpf);
      nomeAluno = dados.nomeAluno;
      pendencias = dados.pendencias;
    } catch {
      // CPF sem cadastro é o caso comum aqui (quem não é aluno cai no
      // financeiro achando que tem vínculo) — não é erro de sistema, e o
      // CPF não fica preso na sessão pra pessoa poder corrigir.
      sessao.cpf = null;
      await this.enviar(sessao, telefone, CPF_SEM_CADASTRO);
      return;
    }

    // Só grava a associação depois de a consulta dar certo — senão um CPF
    // digitado errado ficaria colado no telefone pras próximas conversas.
    await this.salvarCpf(telefone, cpf, nomeAluno);

    if (pendencias.length === 0) {
      await this.enviar(sessao, telefone, SEM_PENDENCIAS);
      return;
    }

    const escolha = await this.modelo.responderJson<RespostaFinanceiro>(
      `${PROMPT_FINANCEIRO}\n\n${this.listarPendencias(pendencias)}`,
      sessao.historico,
    );

    if (escolha?.resposta?.trim()) {
      await this.enviar(sessao, telefone, escolha.resposta.trim());
    }

    const codigos = Array.isArray(escolha?.codigos) ? escolha.codigos : [];
    const selecionadas = pendencias.filter((p) => codigos.includes(p.codigo));

    // Nada selecionado e nenhum texto redigido: o modelo falhou o formato.
    // Melhor listar as parcelas do que deixar o usuário sem resposta.
    if (selecionadas.length === 0 && !escolha?.resposta?.trim()) {
      await this.enviar(sessao, telefone, this.resumoPendencias(pendencias));
      return;
    }

    for (const pendencia of selecionadas) {
      await this.enviarDadosPagamento(telefone, pendencia, sessao);
    }
  }

  /**
   * Dados de pagamento de uma parcela: linha digitável e PIX copia-e-cola em
   * texto, e o QR code como imagem quando o lançamento tem código PIX emitido.
   * Mesmo par texto + `QRCode.toBuffer` da régua de cobrança
   * (`whatsapp-job.service.ts`), e pelo mesmo motivo: colar o código num
   * balão próprio, sem nada em volta, é o que deixa o "copiar" do WhatsApp
   * pegar a linha inteira.
   */
  private async enviarDadosPagamento(
    telefone: string,
    pendencia: Pendencia,
    sessao: SessaoChatbot,
  ): Promise<void> {
    const cabecalho =
      `💰 *${pendencia.descricao}*\n` +
      `📅 Vencimento: ${formatarData(pendencia.vencimento)}\n` +
      `💵 Valor: *${formatarReal(pendencia.valor)}*`;

    if (!pendencia.linhaDigitavel && !pendencia.codigoPix) {
      await this.enviar(
        sessao,
        telefone,
        `${cabecalho}\n\nEssa parcela ainda não tem boleto nem PIX emitido. Assim que for gerado eu consigo te mandar por aqui.`,
      );
      return;
    }

    await this.enviar(sessao, telefone, cabecalho);

    if (pendencia.linhaDigitavel) {
      await this.enviar(
        sessao,
        telefone,
        `*Linha digitável:*\n${pendencia.linhaDigitavel}`,
      );
    }

    if (!pendencia.codigoPix) return;

    await this.enviar(
      sessao,
      telefone,
      `*PIX Copia e Cola:*\n${pendencia.codigoPix}`,
    );

    // QR code é complemento: o código copia-e-cola já foi enviado acima, e
    // uma falha de geração/envio da imagem não pode derrubar o atendimento.
    try {
      const qr = await QRCode.toBuffer(pendencia.codigoPix, {
        width: 260,
        margin: 1,
        type: 'png',
      });
      await this.whatsapp.enviarImagem(
        telefone,
        qr.toString('base64'),
        'QR Code PIX',
        'image/png',
      );
    } catch (err: unknown) {
      this.logger.warn(
        `Falha ao gerar/enviar QR code PIX pro telefone ${maskTelefone(telefone)}: ${errMsg(err)}`,
      );
    }
  }

  /** CPF da sessão, do cache telefone→CPF, ou digitado agora na mensagem. */
  private async resolverCpf(
    telefone: string,
    mensagem: string,
    sessao: SessaoChatbot,
  ): Promise<string | null> {
    const informado = CPF_RE.exec(mensagem)?.[1]?.replace(/\D/g, '');
    if (informado?.length === 11) {
      sessao.cpf = informado;
      return informado;
    }

    if (sessao.cpf) return sessao.cpf;

    try {
      const { cpf } = await this.ia.getCpfPorTelefone(telefone);
      sessao.cpf = cpf;
      return cpf;
    } catch {
      return null;
    }
  }

  private async salvarCpf(
    telefone: string,
    cpf: string,
    nomeAluno: string,
  ): Promise<void> {
    try {
      await this.ia.associarTelefoneCpf({
        telefone,
        cpf,
        nomeResponsavel: nomeAluno,
        tipo: 'aluno',
      });
    } catch (err: unknown) {
      this.logger.warn(
        `Falha ao salvar associação telefone→CPF (${maskTelefone(telefone)}): ${errMsg(err)}`,
      );
    }
  }

  private listarPendencias(pendencias: Pendencia[]): string {
    const linhas = pendencias.map(
      (p) =>
        `- codigo: ${p.codigo} | descrição: ${p.descricao} | vencimento: ${formatarData(p.vencimento)} | valor: ${formatarReal(p.valor)}` +
        ` | boleto emitido: ${p.linhaDigitavel ? 'sim' : 'não'} | PIX emitido: ${p.codigoPix ? 'sim' : 'não'}`,
    );
    return `Parcelas em aberto do aluno:\n${linhas.join('\n')}`;
  }

  /** Fallback determinístico quando o modelo não devolve o JSON esperado. */
  private resumoPendencias(pendencias: Pendencia[]): string {
    const blocos = pendencias.map(
      (p) =>
        `💰 *${p.descricao}*\n📅 Vencimento: ${formatarData(p.vencimento)}\n💵 Valor: *${formatarReal(p.valor)}*`,
    );
    return `${blocos.join('\n\n')}\n\nQual delas você quer pagar?`;
  }

  // --- Demais perguntas ---------------------------------------------------

  private async atenderOutro(
    telefone: string,
    sessao: SessaoChatbot,
  ): Promise<void> {
    const catalogo = await this.catalogoCursos();
    const resposta = await this.modelo.responder(
      `${PROMPT_OUTRO}\n\n${catalogo}`,
      sessao.historico,
    );
    await this.enviar(sessao, telefone, resposta || ERRO_GENERICO);
  }

  /** Catálogo real do Sophia como contexto — sem ele o modelo inventa curso, duração e preço. */
  private async catalogoCursos(): Promise<string> {
    try {
      const cursos = await this.ia.getCursos();
      if (!cursos.length) return 'Catálogo de cursos: indisponível no momento.';
      const linhas = cursos.map((c) => {
        const duracao = c.duracao ? ` | duração: ${c.duracao}` : '';
        const preco = c.precoMensalidade
          ? ` | mensalidade: ${formatarReal(Number(c.precoMensalidade))}`
          : '';
        return `- ${c.nome}${duracao}${preco}`;
      });
      return `Catálogo de cursos do IPESSP:\n${linhas.join('\n')}`;
    } catch (err: unknown) {
      this.logger.warn(`Falha ao carregar catálogo de cursos: ${errMsg(err)}`);
      return 'Catálogo de cursos: indisponível no momento.';
    }
  }

  /** Envia e guarda no histórico, pro modelo enxergar no turno seguinte o que já foi dito. */
  private async enviar(
    sessao: SessaoChatbot,
    telefone: string,
    texto: string,
  ): Promise<void> {
    await this.whatsapp.enviarTexto(telefone, texto);
    this.sessoes.registrarTurno(sessao, 'assistant', texto);
  }
}
