import * as fs from 'fs';
import * as path from 'path';
import {
  templateLembrete,
  templateVencimentoHoje,
  templateCobranca,
  templateAviso,
  templateRenegociacaoOferta,
  templateRenegociacaoLembrete,
} from '../src/email/templates/email.templates';

function comoDataUri(caminhoRelativo: string): string {
  const imgPath = path.resolve(__dirname, '../../site-ipessp-frontend/public/images', caminhoRelativo);
  const ext = path.extname(imgPath).slice(1);
  const base64 = fs.readFileSync(imgPath).toString('base64');
  return `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${base64}`;
}

const dadosFake = {
  nomeAluno: 'João da Silva',
  nomeResponsavel: 'Maria da Silva',
  descricao: 'Mensalidade Junho/2026',
  valor: 'R$ 850,00',
  vencimento: '15/06/2026',
  diasRestantes: 3,
  diasAtraso: 5,
  codigoBarras: '23793.38128 60007.030938 71000.063305 9 10010000085000',
  urlBoleto: 'https://boleto.exemplo.com/pay/abc123',
  codigoPix: '00020126580014br.gov.bcb.pix0136abc123-def4-5678-ghij-klmnopqrstuv5204000053039865802BR5925Escola Exemplo Ltda6009SAO PAULO62070503***6304ABCD',
  codigoMatricula: '10059',
  competencia: '2026-06',
  nomeEscola: 'IPESSP',
  emailEscola: 'matricula.financeiro@ipessp.edu.br',
  telefoneEscola: '(11) 99839-3640',
  logoUrl: 'https://oylhowadealxvsmdhmzc.supabase.co/storage/v1/object/public/assets/logo.png',
  siteUrl: 'https://www.ipessp.edu.br',
  instagramUrl: 'https://www.instagram.com/ipessp/',
  facebookUrl: 'https://www.facebook.com/pages/Ipessp/209464852483898',
  youtubeUrl: 'https://www.youtube.com/channel/UC7dgP6NBgM9L0m11UbhCyHg',
  linkedinUrl: 'https://www.linkedin.com/company/ipessp---educa-o',
  endereco: 'Rua Dona Antônia de Queirós, 333 – São Paulo, SP',
  // Embutido como base64 só para preview local — o site novo ainda não está publicado,
  // então os templates ainda não têm uma URL pública real pra essas imagens.
  avisoImagemUrl: comoDataUri('hero-aviso.jpg'),
  renegociacaoOfertaImagemUrl: comoDataUri('hero-renegociacao-oferta.jpg'),
  renegociacaoLembreteImagemUrl: comoDataUri('hero-renegociacao-lembrete.jpg'),
  iconesUrls: {
    telefone:  comoDataUri('icons/icon-telefone.png'),
    email:     comoDataUri('icons/icon-email.png'),
    site:      comoDataUri('icons/icon-site.png'),
    facebook:  comoDataUri('icons/icon-facebook.png'),
    instagram: comoDataUri('icons/icon-instagram.png'),
    youtube:   comoDataUri('icons/icon-youtube.png'),
    linkedin:  comoDataUri('icons/icon-linkedin.png'),
  },
};

const templates = [
  { nome: 'lembrete', fn: () => templateLembrete(dadosFake) },
  { nome: 'vencimento_hoje', fn: () => templateVencimentoHoje(dadosFake) },
  { nome: 'cobranca', fn: () => templateCobranca(dadosFake) },
  { nome: 'aviso', fn: () => templateAviso(dadosFake) },
  { nome: 'renegociacao_oferta', fn: () => templateRenegociacaoOferta(dadosFake) },
  { nome: 'renegociacao_lembrete', fn: () => templateRenegociacaoLembrete(dadosFake) },
];

const outDir = path.resolve(__dirname, '../email-preview');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

for (const t of templates) {
  const { subject, html } = t.fn();
  const file = path.join(outDir, `${t.nome}.html`);
  fs.writeFileSync(file, html, 'utf8');
  console.log(`✔ ${t.nome}.html — subject: "${subject}"`);
}

console.log(`\nAbra os arquivos em: ${outDir}`);
