-- synchronize está desligado (ver app.module.ts) — rodar manualmente antes de subir
-- a entidade com atribuidoEm e a reatribuição manual/automática de consultoras.

alter table lead add column if not exists "atribuidoEm" timestamptz null;
