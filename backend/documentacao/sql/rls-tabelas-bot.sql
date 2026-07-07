-- RLS para as tabelas exclusivas do backend integracao-sophia-n8n (schema public).
-- Confirmado por código: só acessadas via SUPABASE_SERVICE_KEY (TypeORM/service_role),
-- nenhum uso client-side em site-ipessp-frontend nem em ipessp-corporativo.
-- RLS habilitado sem nenhuma policy = bloqueia totalmente as chaves anon/authenticated;
-- a service_role usada pelo backend ignora RLS normalmente, então nada muda pro bot.

-- IF EXISTS porque nem toda tabela que tem entity no código necessariamente
-- já foi criada/migrada no banco (ex: matriculas_cache não existia ainda).
alter table if exists candidatura enable row level security;
alter table if exists clientes_cache enable row level security;
alter table if exists email_log enable row level security;
alter table if exists lancamentos_cache enable row level security;
alter table if exists lead enable row level security;
alter table if exists lead_historico enable row level security;
alter table if exists manifestacao enable row level security;
alter table if exists mensagem_contato enable row level security;
alter table if exists responsavel_cache enable row level security;
alter table if exists solicitacao_evento enable row level security;
alter table if exists telefone_cpf_cache enable row level security;
alter table if exists matriculas_cache enable row level security;
alter table if exists avisos enable row level security;
alter table if exists calendario enable row level security;

-- ------------------------------------------------------------------
-- "chamados" é DIFERENTE das acima: além do backend do bot (service_role,
-- tools "Abrir Chamado TI"/"Consultar Chamados TI"), o ipessp-corporativo
-- também lê/escreve essa tabela DIRETO DO NAVEGADOR com a chave anon
-- (components/chamados/chamados-view.tsx), autenticado via Supabase Auth.
-- Por isso NÃO pode ficar sem nenhuma policy — precisa liberar pra quem
-- estiver logado, no mesmo padrão que o supabase-schema.sql do corporativo
-- já usa pras tabelas dele (profissionais, pacientes, agendamentos...).
-- ------------------------------------------------------------------
alter table if exists chamados enable row level security;

create policy "Autenticados podem gerenciar chamados" on chamados
  for all using (auth.role() = 'authenticated');

-- Se existir "chamados_comentarios" (referenciada no mesmo componente do
-- corporativo) e ela também estiver como UNRESTRICTED, aplicar o mesmo padrão:
-- alter table chamados_comentarios enable row level security;
-- create policy "Autenticados podem gerenciar comentarios de chamados" on chamados_comentarios
--   for all using (auth.role() = 'authenticated');
