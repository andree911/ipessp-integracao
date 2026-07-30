-- Rodar manualmente (mesmo padrão de curso_conteudo_add_url_pagina.sql).
--
-- Adiciona a URL do PDF informativo de cada curso (material de marketing),
-- servido estaticamente pela VPS em /opt/ipessp/pdfs-cursos/ (ver Caddyfile),
-- usada pelo chatbot (POST /ia/curso-pdf/enviar) pra mandar o material do
-- curso de interesse direto no WhatsApp do lead.
--
-- Mapeamento feito cruzando os PDFs de S:\MARKETING\INFORMATIVOS DE CURSOS
-- (pastas GRADUAÇÃO/PÓS-GRADUAÇÃO/Capacitação/Atualização, ignorando "Old"/2019
-- que são versões desatualizadas) com os 46 cursos ativos em curso_conteudo,
-- em 2026-07-30. Os arquivos já estão na VPS nomeados por um id auxiliar
-- (o id que academico.cursos usa no ipessp-core, não o codigo_curso daqui) —
-- por isso os nomes de arquivo abaixo não batem com codigo_curso, só reaproveitei
-- os uploads já feitos.
--
-- Ambiguidades resolvidas (mais de 1 PDF candidato pro mesmo curso — escolhido
-- o mais recente/específico):
--   [14] Administração Hospitalar: versão presencial (existe variante EAD)
--   [16] Análises Clínica Veterinária: versão mais recente (2026.2)
--   [22] Hematologia e Hemoterapia Laboratorial: versão geral, cobre as 3 modalidades
--   [29] Análises Clínicas: variante semipresencial (bate com a descrição atual)
--   [89] Farmácia Clínica e Atenção Farmacêutica: variante EAD
--   [17,18,19,20] Biomedicina/Biologia/Farmácia/Enfermagem Estética Avançada: cada
--        um tem 3 variantes de modalidade (Presencial/Híbrida/EAD Semipresencial) —
--        por decisão do usuário (2026-07-30), usei a variante HÍBRIDA como padrão.
--
-- 11 cursos ativos (de 46) SEM PDF disponível (nem em "Old") -- pdf_informativo_url
-- continua null pra eles, IA deve dizer que ainda não tem o material e oferecer
-- registrar o lead (mesma regra usada pra descricao/duracao/preco nulos):
--   [34] Curso Introdutório de Circulação Extracorpórea
--   [35] Drenagem Linfática Manual
--   [36] ECMO Básico para equipe multidisciplinar
--   [39] Lifting SS Face Lift
--   [40] Lipo de Papada Aspirativa
--   [41] Microagulhamento Facial, Corporal e Capilar
--   [42] Toxina Botulínica Aplicada Full Face
--   [44] Análises Clínicas Para Graduandos
--   [50] Estética para Graduandos
--   [54] Fisioterapia
--   [56] Acupuntura Integrativa Aplicada a Medicina Chinesa

alter table curso_conteudo add column if not exists pdf_informativo_url text;

update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/1.pdf' where codigo_curso = 6; -- Estética Avançada
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/2.pdf' where codigo_curso = 13; -- Citologia Clinica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/3.pdf' where codigo_curso = 14; -- Administração Hospitalar
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/4.pdf' where codigo_curso = 15; -- Auditoria nos Serviços de Saúde
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/5.pdf' where codigo_curso = 16; -- Análises Clínica Veterinária
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/47.pdf' where codigo_curso = 17; -- Biomedicina Estética Avançada (híbrida)
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/48.pdf' where codigo_curso = 18; -- Biologia Estética Avançada (híbrida)
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/49.pdf' where codigo_curso = 19; -- Farmácia Estética Avançada (híbrida)
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/50.pdf' where codigo_curso = 20; -- Enfermagem Estética Avançada (híbrida)
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/10.pdf' where codigo_curso = 21; -- Microbiologia Clínica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/11.pdf' where codigo_curso = 22; -- Hematologia e Hemoterapia Laboratorial
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/12.pdf' where codigo_curso = 23; -- Farmácia Oncológica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/13.pdf' where codigo_curso = 24; -- Citogenética Clínica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/14.pdf' where codigo_curso = 25; -- Harmonização Orofacial
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/15.pdf' where codigo_curso = 26; -- Imunologia e Oncohematologia por Citometria de Fluxo
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/16.pdf' where codigo_curso = 27; -- Biologia Molecular
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/17.pdf' where codigo_curso = 28; -- Circulação Extracorpórea - Perfusão
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/18.pdf' where codigo_curso = 29; -- Análises Clínicas
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/19.pdf' where codigo_curso = 30; -- Ressonância Magnética e Tomografia Computadorizada
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/20.pdf' where codigo_curso = 31; -- Gestão Hospitalar
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/21.pdf' where codigo_curso = 32; -- Coleta de Materiais Biológicos e Interpretação de Exames
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/22.pdf' where codigo_curso = 33; -- Espermograma
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/26.pdf' where codigo_curso = 37; -- Implantes de Fios Absorvíveis Faciais
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/27.pdf' where codigo_curso = 38; -- Intradermoterapia – Aplicação de Enzimas
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/32.pdf' where codigo_curso = 43; -- Análise Clínico Laboratorial de Líquor e Líquidos Cavitários
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/34.pdf' where codigo_curso = 45; -- Anatomia e Técnicas de Macroscopia de Alta Complexidade
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/35.pdf' where codigo_curso = 46; -- Anatomia e Técnicas de Macroscopia de Baixa e Média Complexidade
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/36.pdf' where codigo_curso = 47; -- Auxiliar de Médico Veterinário
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/37.pdf' where codigo_curso = 48; -- Citologia Hematológica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/38.pdf' where codigo_curso = 49; -- Controle de Qualidade em Laboratórios de Análises Clínicas
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/40.pdf' where codigo_curso = 51; -- Histotecnologia
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/41.pdf' where codigo_curso = 52; -- PCR em Tempo Real e Análises da Expressão Gênica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/42.pdf' where codigo_curso = 53; -- Residência em Estética Avançada
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/45.pdf' where codigo_curso = 59; -- Análises Clínicas da Prática Laboratorial a Interpretação Clínica
update curso_conteudo set pdf_informativo_url = 'https://srv1835634.hstgr.cloud/pdfs-cursos/46.pdf' where codigo_curso = 89; -- Farmácia Clínica e Atenção Farmacêutica
