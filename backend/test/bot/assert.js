'use strict';
/** Mini framework de teste: sem dependência, saída legível, exit code correto. */

const estado = { suite: null, resultados: [], atual: null };

const cor = process.stdout.isTTY
  ? { ok: (s) => `\x1b[32m${s}\x1b[0m`, erro: (s) => `\x1b[31m${s}\x1b[0m`, dim: (s) => `\x1b[90m${s}\x1b[0m`, forte: (s) => `\x1b[1m${s}\x1b[0m` }
  : { ok: (s) => s, erro: (s) => s, dim: (s) => s, forte: (s) => s };

function suite(nome, fn) {
  estado.suite = nome;
  console.log(`\n${cor.forte(nome)}`);
  fn();
  estado.suite = null;
}

function teste(nome, fn) {
  const registro = { suite: estado.suite, nome, falhas: [] };
  estado.atual = registro;
  try {
    fn();
  } catch (e) {
    registro.falhas.push(`erro inesperado: ${e.message}`);
    registro.stack = e.stack;
  }
  estado.atual = null;
  estado.resultados.push(registro);
  const marca = registro.falhas.length ? cor.erro('  ✗') : cor.ok('  ✓');
  console.log(`${marca} ${nome}`);
  for (const f of registro.falhas) console.log(cor.erro(`      ${f}`));
  if (registro.stack && process.env.BOT_TEST_STACK) console.log(cor.dim(registro.stack));
}

function falhar(msg) {
  if (!estado.atual) throw new Error(`asserção fora de um teste: ${msg}`);
  estado.atual.falhas.push(msg);
}

const ok = (cond, msg) => { if (!cond) falhar(msg); };

const igual = (recebido, esperado, msg) => {
  if (recebido !== esperado) falhar(`${msg}\n        esperado: ${JSON.stringify(esperado)}\n        recebido: ${JSON.stringify(recebido)}`);
};

const contem = (texto, trecho, msg) => {
  if (!String(texto ?? '').includes(trecho)) falhar(`${msg}\n        não encontrou: ${JSON.stringify(trecho)}`);
};

const naoContem = (texto, trecho, msg) => {
  if (String(texto ?? '').includes(trecho)) falhar(`${msg}\n        não deveria conter: ${JSON.stringify(trecho)}`);
};

const casa = (texto, re, msg) => {
  if (!re.test(String(texto ?? ''))) falhar(`${msg}\n        não casou com: ${re}`);
};

const naoCasa = (texto, re, msg) => {
  if (re.test(String(texto ?? ''))) falhar(`${msg}\n        não deveria casar com: ${re}`);
};

function relatorio() {
  const total = estado.resultados.length;
  const falhos = estado.resultados.filter((r) => r.falhas.length);
  const asserçoesFalhas = falhos.reduce((n, r) => n + r.falhas.length, 0);
  console.log('');
  if (!falhos.length) {
    console.log(cor.ok(`${total} testes, todos passaram`));
    return 0;
  }
  console.log(cor.erro(`${falhos.length} de ${total} testes falharam (${asserçoesFalhas} asserções)`));
  for (const r of falhos) console.log(cor.erro(`  - [${r.suite}] ${r.nome}`));
  return 1;
}

module.exports = { suite, teste, ok, igual, contem, naoContem, casa, naoCasa, falhar, relatorio };
