'use strict';
/**
 * Extrai as rotas declaradas nos controllers Nest sem compilar nada — só
 * lendo os decorators. É o suficiente pra pegar tool do n8n apontando pra
 * endpoint que foi renomeado ou removido.
 */
const fs = require('fs');
const path = require('path');

function rotasDoController(arquivo) {
  const src = fs.readFileSync(arquivo, 'utf8');
  const prefixo = (src.match(/@Controller\(\s*['"`]([^'"`]*)['"`]\s*\)/) || [, ''])[1];
  const rotas = [];
  const re = /@(Get|Post|Patch|Put|Delete)\(\s*(?:['"`]([^'"`]*)['"`])?\s*\)/g;
  let m;
  while ((m = re.exec(src))) {
    const caminho = [prefixo, m[2] || ''].filter(Boolean).join('/');
    rotas.push(`${m[1].toUpperCase()} /${caminho}`);
  }
  return rotas;
}

function coletarRotas(dirSrc) {
  if (!dirSrc || !fs.existsSync(dirSrc)) return null;
  const rotas = new Set();
  const andar = (dir) => {
    for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entrada.name);
      if (entrada.isDirectory()) andar(p);
      else if (entrada.name.endsWith('.controller.ts')) rotasDoController(p).forEach((r) => rotas.add(r));
    }
  };
  andar(dirSrc);
  return rotas;
}

/** `/crm/leads/:id` casa com `/crm/leads/123`. */
function rotaExiste(rotas, metodo, caminho) {
  const alvo = `${metodo.toUpperCase()} ${caminho}`;
  if (rotas.has(alvo)) return true;
  for (const r of rotas) {
    const [m, c] = r.split(' ');
    if (m !== metodo.toUpperCase()) continue;
    if (new RegExp('^' + c.replace(/:[^/]+/g, '[^/]+') + '$').test(caminho)) return true;
  }
  return false;
}

module.exports = { coletarRotas, rotaExiste, rotasDoController };
