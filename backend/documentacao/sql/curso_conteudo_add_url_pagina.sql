-- Rodar manualmente (synchronize desligado, ver app.module.ts).
--
-- Adiciona a URL da página do curso no site institucional (ipessp.edu.br),
-- usada pelo LeadEmailService pra linkar o email de boas-vindas direto na
-- página do curso de interesse (em vez de sempre cair na home do site).
--
-- Mapeamento feito cruzando os 45 cursos ativos em curso_conteudo (nome vindo
-- da Sophia, ver curso_conteudo_seed.sql) com as páginas reais em
-- https://www.ipessp.edu.br/site/cursos/ (9 páginas, checadas em 2026-07-28).
--
-- 7 cursos ficaram de fora (url_pagina continua null pra eles) por ambiguidade
-- ou por não terem sido encontrados nas páginas do site — confirme manualmente
-- e complete depois pela Table Editor do Supabase:
--   6  Estética Avançada                          -> não encontrado nas 9 páginas
--   17 Biomedicina Estética Avançada               -> ambíguo: existe versão presencial
--      (/biomedicina-estetica/) e versão "40% EAD" (/biomedicina-estetica-semipresencial-ead-60-pratico/)
--   18 Biologia Estética Avançada                 -> mesma ambiguidade: presencial
--      (/biologia-estetica/) vs "40% EAD" (/biologia-estetica-semipresencial-ead-60-pratico/)
--   19 Farmácia Estética Avançada                 -> 3 URLs candidatas conflitantes
--      no site (/farmacia-estetica/, .../https-www-ipessp-edu-br-site-cursos-farmacia-estetica/,
--      e uma com slug de "estética" que não bate com o título "Farmácia")
--   37 Implantes de Fios Absorvíveis Faciais       -> não encontrado nas 9 páginas
--      (pode ser o mesmo curso de "Fios Lisos de Sustentação", não confirmado)
--   40 Lipo de Papada Aspirativa                   -> não encontrado nas 9 páginas
--   89 Farmácia Clínica e Atenção Farmacêutica     -> 2 URLs candidatas (uma "-ead",
--      uma "-e-prescricao"), não deu pra saber qual é a atual

alter table curso_conteudo add column if not exists url_pagina text;

update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/acupuntura/' where codigo_curso = 56;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/administracao-hospitalar/' where codigo_curso = 14;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/analise-clinico-laboratorial-de-liquor-e-liquidos-cavitarios/' where codigo_curso = 43;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/analises-clinicas-veterinaria/' where codigo_curso = 16;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/analises-clinicas/' where codigo_curso = 29;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/analises-clinicas-da-pratica-laboratorial-a-interpretacao-clinica/' where codigo_curso = 59;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/aperfeicoamento-em-analises-clinicas-para-graduandos/' where codigo_curso = 44;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/macroscopia-de-alta-complexidade/' where codigo_curso = 45;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/38582/' where codigo_curso = 46;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/auditoria-nos-servicos-de-saude/' where codigo_curso = 15;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/auxiliar-de-medico-veterinario/' where codigo_curso = 47;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/biologia-molecular-e-citogenetica/' where codigo_curso = 27;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/extracorporea-e-assistencia-circulatoria-mecanica/' where codigo_curso = 28;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/citogenetica-clinica/' where codigo_curso = 24;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/citologia-clinica/' where codigo_curso = 13;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/citologia-hematologica/' where codigo_curso = 48;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/coleta-de-materiais-biologicos-e-interpretacao-de-exames/' where codigo_curso = 32;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/controle-de-qualidade-em-laboratorios-de-analises-clinicas/' where codigo_curso = 49;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/curso-introdutorio-de-circulacao-extracorporea/' where codigo_curso = 34;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/drenagem-linfatica-manual-dlm/' where codigo_curso = 35;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/curso-de-atualizacao-ecmo-basico-para-equipemuldisciplinar/' where codigo_curso = 36;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/enfermagem-estetica-avancada/' where codigo_curso = 20;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/espermograma/' where codigo_curso = 33;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/farmacia-hospitalar-em-oncologia/' where codigo_curso = 23;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/fisioterapia/' where codigo_curso = 54;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/tecnologo-em-gestao-hospitalar/' where codigo_curso = 31;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/pos-graduacao-especializacao-em-harmonizacao-orofacial-hof/' where codigo_curso = 25;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/hematologia-e-hemoterapia-laboratorial/' where codigo_curso = 22;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/histotecnologia-clinica-100-online/' where codigo_curso = 51;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/imunologia-e-citometria-de-fluxo/' where codigo_curso = 26;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/intradermoterapia-aplicacao-de-enzimas/' where codigo_curso = 38;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/curso-lifting-ss-face-lift-facial-temporal-tigomatico-e-cervical/' where codigo_curso = 39;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/microagulhamento-facial-corporal-e-capilar/' where codigo_curso = 41;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/microbiologia-clinica/' where codigo_curso = 21;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/pcr/' where codigo_curso = 52;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/residencia-em-estetica-avancada/' where codigo_curso = 53;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/tomografia-computadorizada-e-ressonancia-magnetica/' where codigo_curso = 30;
update curso_conteudo set url_pagina = 'https://www.ipessp.edu.br/site/cursos/toxina-botulinica-aplicada-a-hof/' where codigo_curso = 42;

-- Bônus: Biomedicina (graduação) não está em curso_conteudo, mas se algum dia
-- entrar, a URL confirmada é https://www.ipessp.edu.br/site/cursos/biomedicina/
