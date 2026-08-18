-- clientes_cache."codigoSophia" não tem constraint de unicidade no banco,
-- só o find-then-save do FinanceiroService#upsertCliente evita duplicata --
-- e isso é uma corrida (TOCTOU): duas execuções concorrentes do sync (ou uma
-- reentrância do cron coincidindo com um trigger manual) podem ambas achar
-- `existing == null` e criar dois registros de cliente pro mesmo aluno.
--
-- Passo 1 (rodar antes): confirma se já existe alguma duplicata em produção.
-- Se retornar linhas, resolva manualmente (decidir qual registro é o
-- "correto" e migrar/apagar o outro) ANTES de aplicar o índice abaixo --
-- senão o CREATE UNIQUE INDEX falha.
--
--   select "codigoSophia", count(*)
--   from clientes_cache
--   where "codigoSophia" is not null
--   group by "codigoSophia"
--   having count(*) > 1;
--
-- Passo 2 (depois de confirmar que não há duplicata): aplica o índice único
-- parcial (permite múltiplos NULL, que é o caso de clientes ainda sem código
-- Sophia associado).
create unique index if not exists "clientes_cache_codigoSophia_unique"
  on clientes_cache ("codigoSophia")
  where "codigoSophia" is not null;
