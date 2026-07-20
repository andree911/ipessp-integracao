-- synchronize está desligado (ver app.module.ts) — rodar manualmente antes de subir a entidade com o campo nome.
-- Denormalizado (não é FK) — cada envio já grava o nome do aluno/lead em mãos, ver EmailJobService/LeadEmailService.
alter table email_log add column if not exists nome character varying;
