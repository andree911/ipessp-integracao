-- synchronize está desligado (ver app.module.ts) — rodar manualmente antes de subir
-- a entidade com consultoraResponsavel e o rodízio de notificação por WhatsApp.

alter table lead add column if not exists "consultoraResponsavel" varchar null;

-- Linha única que guarda o índice da próxima consultora no rodízio (0-based,
-- posição dentro de ZAPI_TELEFONES_CONSULTORAS_MARKETING).
create table if not exists lead_distribuicao_consultoras (
  id integer primary key default 1,
  "proximoIndice" integer not null default 0,
  constraint lead_distribuicao_consultoras_singleton check (id = 1)
);

insert into lead_distribuicao_consultoras (id, "proximoIndice")
values (1, 0)
on conflict (id) do nothing;

-- Só o backend (service_role) acessa essa tabela — mesmo padrão de
-- rls-tabelas-bot.sql: habilitada sem nenhuma policy, o que bloqueia
-- totalmente anon/authenticated e não afeta o backend.
alter table lead_distribuicao_consultoras enable row level security;
