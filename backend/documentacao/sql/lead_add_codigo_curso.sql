-- synchronize está desligado (ver app.module.ts) — rodar manualmente antes de subir
-- a entidade com codigoCurso.
--
-- cursoInteresse é texto livre (o jeito que a IA resumiu o interesse na conversa);
-- codigoCurso é o código do curso na Sophia (bate com curso_conteudo.codigo_curso),
-- passado pela IA quando ela usa a tool "Consultar Cursos" antes de registrar o
-- lead. Serve pra montar o link exato da página do curso no email de boas-vindas,
-- sem depender de comparar texto livre com o nome do curso.
alter table lead add column if not exists "codigoCurso" integer null;
