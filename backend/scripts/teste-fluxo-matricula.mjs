/**
 * Teste do fluxo de matrícula automatizada no Sophia — RODA EM PRODUÇÃO
 * (não existe tenant de homologação separado; a API é sempre portal.sophia.com.br).
 *
 * Valida 3 hipóteses antes de automatizar o webhook do Mercado Pago:
 *   1. O `codigo` retornado por POST /clientes é o mesmo `idAluno` aceito por POST /Matriculas?
 *   2. Os valores de curso/turno/período/unidade batem exatamente com o catálogo do Sophia?
 *   3. `valorPrimeiraParcela` + `dataPagamento` marca a parcela como recebida, ou gera boleto novo?
 *
 * Segurança:
 *   - Todos os GETs (catálogo) rodam livremente, sem confirmação.
 *   - Os POSTs (criar cliente + matricular) só rodam depois de você digitar "SIM".
 *   - O cliente/aluno de teste é criado com nome "TESTE SANDBOX — APAGAR", CPF gerado
 *     (não é de pessoa real) e e-mail em domínio .invalid (reservado, nunca entrega de verdade).
 *   - `enviarEmail=false` é forçado no POST /clientes pra não disparar e-mail real do Sophia.
 *   - Valor da 1ª parcela é fixado em R$ 1,00 pra minimizar qualquer efeito colateral.
 *   - Não existe endpoint de exclusão na API do Sophia — ao final, você precisa cancelar/apagar
 *     esse aluno de teste manualmente pela tela do Sophia. O script imprime o código no final.
 *
 * Uso:
 *   node scripts/teste-fluxo-matricula.mjs
 */

import { createInterface } from 'readline';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');

function readEnv(filePath) {
  if (!existsSync(filePath)) return {};
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

const rl = createInterface({ input: process.stdin, output: process.stdout });

function perguntar(pergunta, ocultar = false) {
  return new Promise((resolve) => {
    if (!ocultar) {
      rl.question(pergunta, resolve);
      return;
    }
    process.stdout.write(pergunta);
    process.stdin.setRawMode(true);
    let resposta = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function handler(char) {
      if (char === '\r' || char === '\n') {
        process.stdin.setRawMode(false);
        process.stdin.removeListener('data', handler);
        process.stdout.write('\n');
        resolve(resposta);
      } else if (char === '') {
        process.exit();
      } else if (char === '') {
        if (resposta.length > 0) {
          resposta = resposta.slice(0, -1);
          process.stdout.write('\b \b');
        }
      } else {
        resposta += char;
        process.stdout.write('*');
      }
    });
  });
}

// ─── CPF de teste válido (checksum mod 11), NÃO é de pessoa real ────────────
function gerarCpfTeste() {
  const n = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10));
  const dv = (base) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += base[i] * (base.length + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const d1 = dv(n);
  const d2 = dv([...n, d1]);
  return [...n, d1, d2].join('');
}

function formatarCpf(cpf) {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

async function main() {
  const env = readEnv(envPath);

  console.log('\n========================================');
  console.log('  Teste do fluxo de matrícula — SophiA');
  console.log('  ATENÇÃO: roda contra produção (tenant real)');
  console.log('========================================\n');

  const baseUrl = (env.SOPHIA_BASE_URL || (await perguntar('SOPHIA_BASE_URL: '))).trim();
  const tenant = (env.SOPHIA_TENANT ?? (await perguntar('SOPHIA_TENANT (vazio se não usar): '))).trim();
  const usuario = (env.SOPHIA_USUARIO || (await perguntar('SOPHIA_USUARIO: '))).trim();
  const senha = (env.SOPHIA_SENHA || (await perguntar('SOPHIA_SENHA: ', true))).trim();

  const API = tenant ? `${baseUrl}/${tenant}/api/v1` : `${baseUrl}/api/v1`;
  console.log(`\nAPI: ${API}\n`);

  async function autenticar() {
    const res = await fetch(`${API}/Autenticacao`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, senha }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`Autenticação falhou (${res.status}): ${text}`);
    return text.replace(/^"|"$/g, '').trim();
  }

  async function chamar(method, path, body) {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json', token },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    return { status: res.status, ok: res.ok, data };
  }

  console.log('Autenticando...');
  const token = await autenticar();
  console.log('Token OK\n');

  // ─── 1. Catálogo — livre, sem confirmação ─────────────────────────────────
  console.log('── Buscando catálogo (Unidades, Cursos, Períodos) ──\n');

  const unidades = await chamar('GET', '/Unidades');
  const cursos = await chamar('GET', '/Cursos');
  const periodos = await chamar('GET', '/Periodos');

  function listar(titulo, resultado) {
    console.log(`${titulo}:`);
    if (!resultado.ok || !Array.isArray(resultado.data)) {
      console.log(`  [erro ${resultado.status}]`, JSON.stringify(resultado.data).slice(0, 300));
      return [];
    }
    resultado.data.slice(0, 30).forEach((item, i) => {
      console.log(`  [${i}] ${JSON.stringify(item)}`);
    });
    if (resultado.data.length > 30) console.log(`  ... (${resultado.data.length} no total, mostrando 30)`);
    console.log('');
    return resultado.data;
  }

  const listaUnidades = listar('Unidades', unidades);
  const listaCursos = listar('Cursos', cursos);
  const listaPeriodos = listar('Períodos', periodos);

  console.log('Copie e cole EXATAMENTE os valores de descrição que o Sophia retornou acima');
  console.log('(é isso que resolve o erro de turma/matéria — nunca digite de cabeça).\n');

  const unidade = (await perguntar('Valor exato de "unidade": ')).trim();
  const curso = (await perguntar('Valor exato de "curso": ')).trim();
  const periodoLetivo = (await perguntar('Valor exato de "periodoLetivo": ')).trim();
  const turno = (await perguntar('Valor de "turno" (Manhã/Tarde/Noite/Integral): ')).trim();
  const curriculo = (await perguntar('Valor de "curriculo" (opcional, Enter pra pular): ')).trim();

  // ─── 2. Confirmação antes de qualquer escrita ─────────────────────────────
  const cpfTeste = gerarCpfTeste();
  const emailTeste = `teste.sandbox.${Date.now()}@ipessp-integracao-teste.invalid`;

  console.log('\n========================================');
  console.log('  Prestes a ESCREVER dados reais no Sophia de PRODUÇÃO');
  console.log('========================================');
  console.log(`  Nome:  TESTE SANDBOX — APAGAR`);
  console.log(`  CPF:   ${formatarCpf(cpfTeste)}  (gerado agora, não é pessoa real)`);
  console.log(`  Email: ${emailTeste}  (domínio .invalid, não entrega de verdade)`);
  console.log(`  Curso: ${curso} / ${turno} / ${periodoLetivo} / ${unidade}`);
  console.log(`  1ª parcela: R$ 1,00, marcada como paga hoje`);
  console.log('========================================\n');

  const confirmar = await perguntar('Digite SIM para prosseguir com os POSTs: ');
  if (confirmar.trim().toUpperCase() !== 'SIM') {
    console.log('\nAbortado pelo usuário. Nenhuma escrita foi feita.');
    rl.close();
    return;
  }

  // ─── 3. POST /clientes ─────────────────────────────────────────────────────
  console.log('\n── POST /clientes ──');
  const bodyCliente = {
    nome: 'TESTE SANDBOX — APAGAR',
    sexo: 'M',
    dataNascimento: '2000-01-01T00:00:00',
    cpf: cpfTeste,
    observacao: 'Registro de teste criado por script — pode apagar.',
    contatos: [{ tipo: 'email', valor: emailTeste }],
    interesse: { curso, turno, periodo: periodoLetivo, unidade },
  };
  const respCliente = await chamar('POST', '/clientes?enviarEmail=false', bodyCliente);
  console.log(`Status: ${respCliente.status}`);
  console.log('Resposta:', JSON.stringify(respCliente.data, null, 2));

  let codigoAluno = respCliente.data?.codigo ?? respCliente.data?.codigoAluno ?? null;

  if (!codigoAluno) {
    console.log('\nA resposta não trouxe um "codigo" direto. Procurando o aluno pelo CPF de teste...');
    for (let pagina = 1; pagina <= 10 && !codigoAluno; pagina++) {
      const busca = await chamar('GET', `/Alunos?Pagina=${pagina}&TamanhoPagina=200`);
      if (!Array.isArray(busca.data) || busca.data.length === 0) break;
      const achado = busca.data.find((a) => (a.cpf ?? '').replace(/\D/g, '') === cpfTeste);
      if (achado) codigoAluno = achado.codigo;
    }
  }

  if (!codigoAluno) {
    console.log('\n❌ Não foi possível localizar o código do aluno criado.');
    console.log('   HIPÓTESE 1 (codigo do cliente = idAluno) NÃO CONFIRMADA — POST /clientes');
    console.log('   provavelmente não converte em aluno automaticamente, ou o aluno demora');
    console.log('   pra aparecer na listagem. Verifique manualmente no Sophia pelo CPF:');
    console.log(`   ${formatarCpf(cpfTeste)}`);
    rl.close();
    return;
  }

  console.log(`\n✅ codigoAluno encontrado: ${codigoAluno}`);

  // ─── 4. Confirma via GET /Alunos/{codigo} ──────────────────────────────────
  console.log(`\n── GET /Alunos/${codigoAluno} ──`);
  const respAluno = await chamar('GET', `/Alunos/${codigoAluno}`);
  console.log(`Status: ${respAluno.status}`);
  console.log('Resposta:', JSON.stringify(respAluno.data, null, 2));

  // ─── 5. POST /alunos/{codigo}/Matriculas ──────────────────────────────────
  console.log(`\n── POST /alunos/${codigoAluno}/Matriculas ──`);
  const hoje = new Date().toISOString().substring(0, 10);
  const bodyMatricula = {
    unidade,
    curso,
    turno,
    periodoLetivo,
    ...(curriculo ? { curriculo } : {}),
    valorPrimeiraParcela: 1.0,
    dataPagamento: `${hoje}T00:00:00`,
  };
  const respMatricula = await chamar('POST', `/alunos/${codigoAluno}/Matriculas`, bodyMatricula);
  console.log(`Status: ${respMatricula.status}`);
  console.log('Resposta:', JSON.stringify(respMatricula.data, null, 2));

  if (!respMatricula.ok) {
    console.log('\n❌ POST /Matriculas falhou.');
    console.log('   HIPÓTESE 2 (valores de catálogo corretos evitam erro de turma/matéria)');
    console.log('   ainda não confirmada — confira a mensagem de erro acima. Se citar');
    console.log('   turma/matéria mesmo com valores exatos do catálogo, é caso de chamado');
    console.log('   com o suporte Sophia pedindo um payload de exemplo que funcione.');
    rl.close();
    return;
  }

  console.log('\n✅ Matrícula criada com sucesso — HIPÓTESE 2 confirmada com esses valores de catálogo.');

  // ─── 6. GET /alunos/{codigo}/Lancamentos ──────────────────────────────────
  console.log(`\n── GET /alunos/${codigoAluno}/Lancamentos ──`);
  const respLancamentos = await chamar('GET', `/alunos/${codigoAluno}/Lancamentos`);
  console.log(`Status: ${respLancamentos.status}`);
  console.log('Resposta:', JSON.stringify(respLancamentos.data, null, 2));

  console.log('\n========================================');
  console.log('  Interpretação da HIPÓTESE 3');
  console.log('========================================');
  if (Array.isArray(respLancamentos.data) && respLancamentos.data.length > 0) {
    const l = respLancamentos.data[0];
    if (l.recebido && Number(l.recebido) > 0 && !l.codigoBoleto) {
      console.log('✅ recebido > 0 e sem boleto novo → dataPagamento marcou a parcela como PAGA.');
      console.log('   Fluxo automatizável sem risco de cobrança duplicada com o Mercado Pago.');
    } else if (l.codigoBoleto || l.linhaDigitavel) {
      console.log('⚠️  Veio um boleto/linha digitável novo → o Sophia GEROU uma cobrança pendente');
      console.log('   pra 1ª parcela, mesmo com dataPagamento preenchido. Isso duplicaria a cobrança');
      console.log('   já feita no Mercado Pago. Vai precisar de baixa manual no Sophia após a automação.');
    } else {
      console.log('Inconclusivo pelos campos retornados — inspecione o JSON acima manualmente.');
    }
  } else {
    console.log('Nenhum lançamento retornado ainda — pode ser processamento assíncrono do lado');
    console.log('do Sophia. Rode de novo em alguns minutos: node scripts/teste-fluxo-matricula.mjs');
    console.log('(vai pedir os dados de novo — ou adapte pra só repetir o GET de Lancamentos).');
  }

  console.log('\n========================================');
  console.log('  LIMPEZA MANUAL NECESSÁRIA');
  console.log('========================================');
  console.log(`  Não existe endpoint de exclusão na API do Sophia.`);
  console.log(`  Acesse o Sophia e cancele/apague o aluno de teste:`);
  console.log(`    codigoAluno: ${codigoAluno}`);
  console.log(`    CPF:         ${formatarCpf(cpfTeste)}`);
  console.log(`    Nome:        TESTE SANDBOX — APAGAR\n`);

  rl.close();
}

main().catch((err) => {
  console.error('\nErro:', err.message);
  process.exit(1);
});
