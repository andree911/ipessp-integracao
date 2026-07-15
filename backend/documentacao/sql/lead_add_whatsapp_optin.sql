-- synchronize está desligado (ver app.module.ts) — rodar manualmente antes de subir a entidade com whatsappOptin.
alter table lead add column if not exists "whatsappOptin" boolean not null default false;
