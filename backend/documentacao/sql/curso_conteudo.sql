-- Tabela de conteúdo institucional/comercial dos cursos.
-- A Sophia (GET /Cursos) só devolve codigo, nome e nomeResumido — duração,
-- preço de mensalidade e descrição não existem lá, então ficam mantidos aqui
-- pela equipe (marketing/comercial) e são combinados com a lista viva da
-- Sophia em IaService.getCursos().
create table if not exists curso_conteudo (
  id uuid primary key default gen_random_uuid(),
  codigo_curso integer not null unique, -- código do curso na Sophia (bate com o "codigo" de GET /Cursos)
  nome text, -- só pra referência visual na Table Editor; o backend sempre usa o nome vindo da Sophia, nunca este aqui
  descricao text,
  duracao text,
  preco_mensalidade numeric(10, 2),
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- RLS habilitado e sem nenhuma policy: só a service_role (usada pelo backend)
-- consegue ler/escrever. Chaves anon/authenticated não têm acesso nenhum.
alter table curso_conteudo enable row level security;
