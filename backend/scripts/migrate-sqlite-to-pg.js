'use strict';

/**
 * Migra dados do SQLite local para o Supabase (PostgreSQL).
 *
 * Uso no Render Shell:
 *   npm install pg
 *   DATABASE_URL=postgres://... DATABASE_PATH=./data/sync.db node scripts/migrate-sqlite-to-pg.js
 */

const Database = require('better-sqlite3');
const { Client } = require('pg');

const SQLITE_PATH = process.env.DATABASE_PATH || './data/sync.db';
const PG_URL = process.env.DATABASE_URL;

if (!PG_URL) {
  console.error('ERRO: DATABASE_URL é obrigatório.');
  process.exit(1);
}

// Colunas boolean armazenadas como 0/1 no SQLite
const BOOL_COLS = new Set(['enviado', 'ativo', 'validado', 'usado']);

// Definição das tabelas (DDL PostgreSQL + nome da tabela SQLite)
const TABLES = [
  {
    name: 'clientes_cache',
    ddl: `
      CREATE TABLE IF NOT EXISTS clientes_cache (
        id SERIAL PRIMARY KEY,
        "codigoSophia" integer,
        cpf character varying,
        "nomeAluno" character varying NOT NULL,
        "nomeResponsavel" character varying,
        "emailResponsavel" character varying,
        "telefoneResponsavel" character varying,
        ra character varying,
        "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'lancamentos_cache',
    ddl: `
      CREATE TABLE IF NOT EXISTS lancamentos_cache (
        id SERIAL PRIMARY KEY,
        "codigoSophia" integer,
        "codigoCliente" integer NOT NULL,
        descricao character varying,
        "valorPrevisto" numeric(10,2) NOT NULL,
        "dataVencimento" character varying NOT NULL,
        recebido integer NOT NULL DEFAULT 0,
        "linhaDigitavel" character varying,
        "urlBoleto" character varying,
        "codigoPix" character varying,
        competencia character varying,
        "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_lancamentos_sofia_cliente" UNIQUE ("codigoSophia", "codigoCliente")
      )`,
  },
  {
    name: 'responsavel_cache',
    ddl: `
      CREATE TABLE IF NOT EXISTS responsavel_cache (
        id SERIAL PRIMARY KEY,
        cpf character varying NOT NULL,
        "codigoAluno" integer NOT NULL,
        "nomeAluno" character varying NOT NULL,
        "codigoResponsavel" integer NOT NULL,
        "nomeResponsavel" character varying NOT NULL,
        email character varying,
        "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_responsavel_cpf_aluno" UNIQUE (cpf, "codigoAluno")
      )`,
  },
  {
    name: 'telefone_cpf_cache',
    ddl: `
      CREATE TABLE IF NOT EXISTS telefone_cpf_cache (
        id SERIAL PRIMARY KEY,
        telefone character varying NOT NULL,
        cpf character varying NOT NULL,
        "nomeResponsavel" character varying,
        "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_telefone_cpf_cache_telefone" UNIQUE (telefone)
      )`,
  },
  {
    name: 'email_log',
    ddl: `
      CREATE TABLE IF NOT EXISTS email_log (
        id SERIAL PRIMARY KEY,
        "codigoLancamento" character varying NOT NULL DEFAULT '',
        "leadId" integer,
        tipo character varying NOT NULL,
        destinatario character varying NOT NULL,
        erro character varying,
        enviado boolean NOT NULL DEFAULT false,
        "enviadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'lead',
    ddl: `
      CREATE TABLE IF NOT EXISTS lead (
        id SERIAL PRIMARY KEY,
        nome character varying NOT NULL,
        email character varying,
        telefone character varying,
        "cursoInteresse" character varying,
        origem character varying NOT NULL DEFAULT 'site',
        status character varying NOT NULL DEFAULT 'novo',
        observacao text,
        "sophiaCodigo" character varying,
        "sophiaAlunoId" integer,
        "sophiaErro" text,
        "criadoEm" TIMESTAMP NOT NULL DEFAULT now(),
        "atualizadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'lead_historico',
    ddl: `
      CREATE TABLE IF NOT EXISTS lead_historico (
        id SERIAL PRIMARY KEY,
        "leadId" integer NOT NULL,
        "estagioAnterior" character varying,
        "estagioNovo" character varying NOT NULL,
        observacao text,
        "criadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'mensagem_contato',
    ddl: `
      CREATE TABLE IF NOT EXISTS mensagem_contato (
        id SERIAL PRIMARY KEY,
        nome character varying NOT NULL,
        email character varying NOT NULL,
        telefone character varying,
        assunto character varying,
        mensagem text NOT NULL,
        "criadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'manifestacao',
    ddl: `
      CREATE TABLE IF NOT EXISTS manifestacao (
        id SERIAL PRIMARY KEY,
        tipo character varying NOT NULL,
        nome character varying NOT NULL,
        email character varying NOT NULL,
        mensagem text NOT NULL,
        "criadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'solicitacao_evento',
    ddl: `
      CREATE TABLE IF NOT EXISTS solicitacao_evento (
        id SERIAL PRIMARY KEY,
        nome character varying NOT NULL,
        email character varying NOT NULL,
        telefone character varying,
        organizacao character varying,
        "tipoEvento" character varying,
        descricao text NOT NULL,
        "dataEvento" character varying,
        "criadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'candidatura',
    ddl: `
      CREATE TABLE IF NOT EXISTS candidatura (
        id SERIAL PRIMARY KEY,
        nome character varying NOT NULL,
        email character varying NOT NULL,
        area character varying NOT NULL,
        mensagem text,
        "curriculoUrl" character varying,
        "curriculoNome" character varying,
        "criadoEm" TIMESTAMP NOT NULL DEFAULT now()
      )`,
  },
  {
    name: 'usuarios',
    ddl: `
      CREATE TABLE IF NOT EXISTS usuarios (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email character varying NOT NULL,
        senha_hash character varying NOT NULL,
        tipo character varying NOT NULL,
        nome character varying NOT NULL,
        ativo boolean NOT NULL DEFAULT true,
        sophia_aluno_id integer,
        criado_em TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_usuarios_email" UNIQUE (email)
      )`,
  },
  {
    name: 'professores',
    ddl: `
      CREATE TABLE IF NOT EXISTS professores (
        id SERIAL PRIMARY KEY,
        usuario_id character varying NOT NULL,
        matricula text,
        telefone text,
        validado boolean NOT NULL DEFAULT false,
        sophia_id integer
      )`,
  },
  {
    name: 'refresh_tokens',
    ddl: `
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id character varying NOT NULL,
        token_hash character varying NOT NULL,
        expira_em TIMESTAMP NOT NULL
      )`,
  },
  {
    name: 'reset_tokens',
    ddl: `
      CREATE TABLE IF NOT EXISTS reset_tokens (
        id SERIAL PRIMARY KEY,
        usuario_id character varying NOT NULL,
        token character varying NOT NULL,
        expira_em TIMESTAMP NOT NULL,
        usado boolean NOT NULL DEFAULT false
      )`,
  },
];

async function migrate() {
  console.log(`SQLite: ${SQLITE_PATH}`);
  console.log(`PostgreSQL: ${PG_URL.replace(/:([^:@]+)@/, ':***@')}\n`);

  const sqlite = new Database(SQLITE_PATH, { readonly: true });
  const pg = new Client({ connectionString: PG_URL, ssl: { rejectUnauthorized: false } });
  await pg.connect();

  for (const { name, ddl } of TABLES) {
    // Cria a tabela no Postgres (se não existir)
    await pg.query(ddl);

    // Lê dados do SQLite
    let rows;
    try {
      rows = sqlite.prepare(`SELECT * FROM "${name}"`).all();
    } catch {
      console.log(`  ${name}: tabela não encontrada no SQLite, pulando`);
      continue;
    }

    if (!rows.length) {
      console.log(`  ${name}: 0 linhas`);
      continue;
    }

    const cols = Object.keys(rows[0]);
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const quotedCols = cols.map((c) => `"${c}"`).join(', ');
    const sql = `INSERT INTO "${name}" (${quotedCols}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;

    let ok = 0;
    let skip = 0;
    for (const row of rows) {
      const values = cols.map((col) => {
        const v = row[col];
        if (v === null || v === undefined) return null;
        if (BOOL_COLS.has(col)) return v === 1 || v === true;
        return v;
      });
      try {
        const res = await pg.query(sql, values);
        res.rowCount > 0 ? ok++ : skip++;
      } catch (e) {
        console.error(`  ERRO em ${name} id=${row.id ?? '?'}: ${e.message}`);
      }
    }

    console.log(`  ${name}: ${ok} migradas, ${skip} já existiam`);

    // Atualiza a sequence do SERIAL para evitar conflito de PK nos próximos INSERTs
    const hasNumericId = rows.length && typeof rows[0].id === 'number';
    if (hasNumericId) {
      const maxId = Math.max(...rows.map((r) => r.id));
      await pg.query(`SELECT setval('"${name}_id_seq"', $1, true)`, [maxId]);
    }
  }

  sqlite.close();
  await pg.end();
  console.log('\n✓ Migração concluída!');
}

migrate().catch((err) => {
  console.error('\nFalha na migração:', err.message);
  process.exit(1);
});
