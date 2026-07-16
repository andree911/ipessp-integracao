import * as fs from 'fs';
import * as path from 'path';
import {
  templateCancelamentoAcademico,
  templateCancelamentoFinanceiro,
  emailRelatorioMatricula,
} from '../src/email/templates/email.templates';
import { LeadEmailService } from '../src/email/lead-email.service';

const outDir = path.resolve(__dirname, '../email-preview');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const dadosEscola = {
  nomeEscola: 'IPESSP',
  emailEscola: 'matricula.financeiro@ipessp.edu.br',
  telefoneEscola: '(11) 99839-3640',
  siteUrl: 'https://www.ipessp.edu.br',
};

const cancelamentos = [
  {
    nome: 'cancelamento_academico_com_divida',
    fn: () =>
      templateCancelamentoAcademico({
        ...dadosEscola,
        nomeAluno: 'João da Silva',
        numeroParcelasRestantes: 8,
        valorParcela: 850,
        somaValor: 6800,
        valorMulta: 680,
        parcelasEmAtraso: 2,
        saldoDevedor: 1700,
      }),
  },
  {
    nome: 'cancelamento_academico_sem_divida',
    fn: () =>
      templateCancelamentoAcademico({
        ...dadosEscola,
        nomeAluno: 'João da Silva',
        numeroParcelasRestantes: 8,
        valorParcela: 850,
        somaValor: 6800,
        valorMulta: 680,
        parcelasEmAtraso: 0,
        saldoDevedor: 0,
      }),
  },
  {
    nome: 'cancelamento_financeiro',
    fn: () =>
      templateCancelamentoFinanceiro({
        ...dadosEscola,
        nomeAluno: 'João da Silva',
        numeroParcelasRestantes: 0,
        valorParcela: 0,
        somaValor: 0,
        valorMulta: 0,
        parcelasEmAtraso: 0,
        saldoDevedor: 0,
      }),
  },
];

for (const t of cancelamentos) {
  const { subject, html } = t.fn();
  fs.writeFileSync(path.join(outDir, `${t.nome}.html`), html, 'utf8');
  console.log(`✔ ${t.nome}.html — subject: "${subject}"`);
}

const relatorioHtml = emailRelatorioMatricula({
  nomeAluno: 'João da Silva',
  cpfAluno: '123.456.789-00',
  emailAluno: 'joao.silva@example.com',
  telefoneAluno: '(11) 98888-7777',
  nomeResponsavel: 'Maria da Silva',
  cpfResponsavel: '987.654.321-00',
  emailResponsavel: 'maria.silva@example.com',
  telefoneResponsavel: '(11) 97777-6666',
  curso: 'Biomedicina',
  unidade: 'Unidade Centro',
  turno: 'Noturno',
  periodoLetivo: '2026/2',
  numeroParcelas: 12,
  valorParcela: 890,
  dataPrimeiraParcela: '10/08/2026',
  desconto: '10% pontualidade',
  codigoAluno: 10059,
  dataMatricula: '16/07/2026',
  nomeEscola: 'IPESSP',
});
fs.writeFileSync(path.join(outDir, 'relatorio_matricula_interno.html'), relatorioHtml, 'utf8');
console.log('✔ relatorio_matricula_interno.html — subject: (interno, sem assunto definido na função)');

// LeadEmailService: templates de boas-vindas/follow-up/CTA são métodos privados na classe,
// então instanciamos via prototype (sem passar pelas dependências de DI) só para renderizar o HTML.
const configFake: Record<string, string> = {
  'email.nomeEscola': 'IPESSP',
  'email.from': 'matricula.financeiro@ipessp.edu.br',
  'email.telefoneEscola': '(11) 99839-3640',
  'email.logoUrl': 'https://oylhowadealxvsmdhmzc.supabase.co/storage/v1/object/public/assets/logo.png',
  'email.siteUrl': 'https://www.ipessp.edu.br',
  'email.assetsBaseUrl': '',
  'email.instagramUrl': 'https://www.instagram.com/ipessp/',
  'email.facebookUrl': 'https://www.facebook.com/pages/Ipessp/209464852483898',
  'email.youtubeUrl': 'https://www.youtube.com/channel/UC7dgP6NBgM9L0m11UbhCyHg',
  'email.linkedinUrl': 'https://www.linkedin.com/company/ipessp---educa-o',
  'email.cnpj': '',
  'email.endereco': 'Rua Dona Antônia de Queirós, 333 – São Paulo, SP',
};
const fakeLeadService = Object.create(LeadEmailService.prototype) as any;
fakeLeadService.config = { get: (key: string) => configFake[key] };

const leadTemplates = [
  { nome: 'lead_boas_vindas', subject: 'Bem-vindo(a) ao IPESSP — seu futuro começa aqui!', fn: () => fakeLeadService.templateBoasVindas('João da Silva', 'Biomedicina') },
  { nome: 'lead_followup', subject: 'Ainda pensando? Podemos ajudar — IPESSP', fn: () => fakeLeadService.templateFollowUp('João da Silva', 'Biomedicina') },
  { nome: 'lead_cta', subject: 'Última chamada: inscrições abertas no IPESSP', fn: () => fakeLeadService.templateCta('João da Silva', 'Biomedicina') },
];

for (const t of leadTemplates) {
  const html = t.fn();
  fs.writeFileSync(path.join(outDir, `${t.nome}.html`), html, 'utf8');
  console.log(`✔ ${t.nome}.html — subject: "${t.subject}"`);
}

console.log(`\nAbra os arquivos em: ${outDir}`);
