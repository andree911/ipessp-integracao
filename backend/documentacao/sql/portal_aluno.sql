-- Portal do Aluno: conta própria (RA + senha criada no "primeiro acesso"),
-- refresh tokens (sessão) e reset tokens (esqueci senha).
-- Só o backend acessa (conexão direta TypeORM) — RLS habilitado sem policy.

create table if not exists portal_aluno_conta (
  id uuid primary key default gen_random_uuid(),
  ra varchar not null,
  codigo_sophia integer not null, -- aluno.codigo na Sophia
  nome varchar not null,
  senha_hash varchar not null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create unique index if not exists idx_portal_aluno_conta_ra on portal_aluno_conta (ra);

create table if not exists portal_aluno_refresh_token (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null,
  token_hash varchar not null,
  expira_em timestamptz not null,
  criado_em timestamptz not null default now()
);
create index if not exists idx_portal_aluno_refresh_token_conta on portal_aluno_refresh_token (conta_id);

create table if not exists portal_aluno_reset_token (
  id uuid primary key default gen_random_uuid(),
  conta_id uuid not null,
  token_hash varchar not null,
  expira_em timestamptz not null,
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);
create index if not exists idx_portal_aluno_reset_token_conta on portal_aluno_reset_token (conta_id);

alter table portal_aluno_conta enable row level security;
alter table portal_aluno_refresh_token enable row level security;
alter table portal_aluno_reset_token enable row level security;

-- Índice em clientes_cache.ra, usado na validação do "primeiro acesso".
create index if not exists idx_clientes_cache_ra on clientes_cache (ra);
