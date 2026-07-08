-- Migração da Fase 2 do Portal do Aluno: login passou a validar a senha
-- REAL da Sophia (POST /Alunos/ValidarLogin) em vez de uma senha própria
-- criada num fluxo de "primeiro acesso". Não existe mais conta local com
-- senha, então as tabelas de conta e de reset de senha somem.
--
-- Rode isso DEPOIS do deploy do backend com a nova versão (a versão antiga
-- ainda vai tentar gravar em portal_aluno_conta até o deploy acontecer).

drop table if exists portal_aluno_conta cascade;
drop table if exists portal_aluno_reset_token cascade;

-- portal_aluno_refresh_token agora guarda ra/codigo_sophia/nome direto (sem
-- FK pra conta), pra reemitir sessão no refresh sem precisar de outra tabela.
alter table portal_aluno_refresh_token drop column if exists conta_id;
alter table portal_aluno_refresh_token add column if not exists ra text;
alter table portal_aluno_refresh_token add column if not exists codigo_sophia integer;
alter table portal_aluno_refresh_token add column if not exists nome text;

-- Sessões antigas (emitidas pelo sistema de senha própria) ficam órfãs sem
-- ra/codigo_sophia preenchido — melhor invalidar todas e pedir novo login.
delete from portal_aluno_refresh_token where ra is null;

alter table portal_aluno_refresh_token alter column ra set not null;
alter table portal_aluno_refresh_token alter column codigo_sophia set not null;
alter table portal_aluno_refresh_token alter column nome set not null;

create index if not exists idx_portal_aluno_refresh_token_ra on portal_aluno_refresh_token (ra);

-- ─────────────────────────────────────────────────────────────────────────
-- Storage pra upload de documentos (Fase 2 — envio de documentos pro Sophia)
-- ─────────────────────────────────────────────────────────────────────────
-- A Sophia (POST /clientes/{id}/Documentos) só aceita uma URL de download,
-- não arquivo direto — então o arquivo sobe primeiro pro Supabase Storage.
-- Criar manualmente pelo dashboard (Storage → New bucket), igual foi feito
-- pro bucket "candidaturas" que já existe:
--   nome: portal-aluno
--   público: sim (o backend gera getPublicUrl() e manda essa URL pra Sophia
--   baixar o arquivo — se o bucket não for público, a Sophia não consegue
--   acessar o link)
