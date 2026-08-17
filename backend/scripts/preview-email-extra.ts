import * as fs from 'fs';
import * as path from 'path';
import {
  templateCancelamentoAcademico,
  templateCancelamentoFinanceiro,
} from '../src/email/templates/email.templates';

const outDir = path.resolve(__dirname, '../email-preview');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const dadosEscola = {
  nomeEscola: 'IPESSP',
  emailEscola: 'matricula.financeiro@ipessp.edu.br',
  telefoneEscola: '(11) 99839-3640',
  siteUrl: 'https://www.ipessp.edu.br',
  logoUrl: 'https://oylhowadealxvsmdhmzc.supabase.co/storage/v1/object/public/assets/logo.png',
  instagramUrl: 'https://www.instagram.com/ipessp/',
  facebookUrl: 'https://www.facebook.com/pages/Ipessp/209464852483898',
  youtubeUrl: 'https://www.youtube.com/channel/UC7dgP6NBgM9L0m11UbhCyHg',
  linkedinUrl: 'https://www.linkedin.com/company/ipessp---educa-o',
  endereco: 'Rua Dona Antônia de Queirós, 333 – São Paulo, SP',
};

const cancelamentos = [
  {
    // Disparado pelo check "Acadêmico" — sempre o mesmo texto, sem valores.
    nome: 'cancelamento_academico',
    fn: () =>
      templateCancelamentoAcademico({
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
  // Os 3 abaixo são disparados pelo check "Financeiro" — a própria função
  // escolhe o texto certo a partir de valorMulta/parcelasEmAtraso.
  {
    nome: 'cancelamento_financeiro_multa_e_atraso',
    fn: () =>
      templateCancelamentoFinanceiro({
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
    nome: 'cancelamento_financeiro_so_multa',
    fn: () =>
      templateCancelamentoFinanceiro({
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
    nome: 'cancelamento_financeiro_sem_pendencia',
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

console.log(`\nAbra os arquivos em: ${outDir}`);
