-- Rodar só se curso_conteudo já foi criada (sem a coluna nome).
alter table curso_conteudo add column if not exists nome text;
