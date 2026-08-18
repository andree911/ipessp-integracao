/**
 * Sobe uma imagem local pro MinIO da VPS (bucket "assets") e imprime a URL
 * pública final -- pensado pros banners do job de cobrança do WhatsApp
 * (WPP_IMAGEM_LEMBRETE_URL / WPP_IMAGEM_COBRANCA_URL), mas serve pra
 * qualquer imagem pública que precise ir pro mesmo storage.
 *
 * Rodar num ambiente com rede até o MinIO da VPS e com o .env real
 * preenchido (MINIO_ENDPOINT, MINIO_PORT, MINIO_USE_SSL, MINIO_ACCESS_KEY,
 * MINIO_SECRET_KEY, MINIO_PUBLIC_BASE_URL) -- normalmente na própria VPS.
 *
 * Uso:
 *   node scripts/upload-imagem-cobranca.mjs <caminho-do-arquivo> <nome-do-objeto>
 *
 * Exemplo:
 *   node scripts/upload-imagem-cobranca.mjs ./banner-lembrete.jpg whatsapp/cobranca-lembrete.jpg
 *   node scripts/upload-imagem-cobranca.mjs ./banner-atraso.jpg whatsapp/cobranca-atraso.jpg
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Client as MinioClient } from 'minio';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

function readEnv(filePath) {
  const lines = readFileSync(filePath, 'utf8').split('\n');
  const vars = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    vars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
  }
  return vars;
}

const MIME_POR_EXTENSAO = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  jfif: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

const [, , caminhoArquivo, nomeObjeto] = process.argv;

if (!caminhoArquivo || !nomeObjeto) {
  console.error('❌  Uso: node scripts/upload-imagem-cobranca.mjs <caminho-do-arquivo> <nome-do-objeto>');
  console.error('    Exemplo: node scripts/upload-imagem-cobranca.mjs ./banner.jpg whatsapp/cobranca-lembrete.jpg');
  process.exit(1);
}

if (!existsSync(caminhoArquivo)) {
  console.error(`❌  Arquivo não encontrado: ${caminhoArquivo}`);
  process.exit(1);
}

if (!existsSync(envPath)) {
  console.error(`❌  .env não encontrado em ${envPath} -- rode este script a partir de um checkout com o .env real da VPS preenchido.`);
  process.exit(1);
}

const env = readEnv(envPath);
const endpoint = env['MINIO_ENDPOINT'];
const port = parseInt(env['MINIO_PORT'] ?? '9000', 10);
const useSSL = env['MINIO_USE_SSL'] === 'true';
const accessKey = env['MINIO_ACCESS_KEY'];
const secretKey = env['MINIO_SECRET_KEY'];
const publicBaseUrl = (env['MINIO_PUBLIC_BASE_URL'] ?? '').replace(/\/$/, '');

if (!endpoint || !accessKey || !secretKey || !publicBaseUrl) {
  console.error('❌  MINIO_ENDPOINT / MINIO_ACCESS_KEY / MINIO_SECRET_KEY / MINIO_PUBLIC_BASE_URL precisam estar preenchidos no .env.');
  process.exit(1);
}

const extensao = (caminhoArquivo.split('.').pop() ?? '').toLowerCase();
const mimeType = MIME_POR_EXTENSAO[extensao];
if (!mimeType) {
  console.error(`❌  Extensão ".${extensao}" não reconhecida. Extensões aceitas: ${Object.keys(MIME_POR_EXTENSAO).join(', ')}`);
  process.exit(1);
}

const BUCKET = 'assets';

const client = new MinioClient({ endPoint: endpoint, port, useSSL, accessKey, secretKey });

console.log('\n========================================');
console.log('  Upload de imagem — MinIO');
console.log('========================================');
console.log(`Arquivo:  ${caminhoArquivo}`);
console.log(`Bucket:   ${BUCKET}`);
console.log(`Objeto:   ${nomeObjeto}`);
console.log(`Endpoint: ${endpoint}:${port} (SSL: ${useSSL})\n`);

try {
  const existeBucket = await client.bucketExists(BUCKET).catch(() => false);
  if (!existeBucket) {
    console.log(`Bucket "${BUCKET}" não existe ainda, criando...`);
    await client.makeBucket(BUCKET);
    // Leitura pública anônima -- mesmo motivo do bucket "candidaturas"/"portal-aluno":
    // o Caddy serve /files/* sem passar pelo backend, então o objeto precisa
    // ser legível sem credencial.
    const politica = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Action: ['s3:GetObject'],
          Resource: [`arn:aws:s3:::${BUCKET}/*`],
        },
      ],
    };
    await client.setBucketPolicy(BUCKET, JSON.stringify(politica));
    console.log(`Bucket "${BUCKET}" criado com leitura pública.\n`);
  }

  const buffer = readFileSync(caminhoArquivo);
  await client.putObject(BUCKET, nomeObjeto, buffer, buffer.length, {
    'Content-Type': mimeType,
  });

  const urlFinal = `${publicBaseUrl}/${BUCKET}/${nomeObjeto}`;
  console.log('✅  Upload concluído!\n');
  console.log(`    URL pública: ${urlFinal}\n`);
} catch (err) {
  console.error(`\n❌  Falha no upload: ${err.message}`);
  process.exit(1);
}
