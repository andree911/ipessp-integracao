-- Preenche descricao/duracao/preco_mensalidade em curso_conteudo com os dados
-- comerciais reais tirados de cursos_conteudo.md (fonte de verdade).
--
-- Regras aplicadas:
-- 1. preco_mensalidade = sempre a MENOR parcela mensal disponível pro curso;
--    o detalhe completo de todos os planos/turnos fica no texto de descricao.
-- 2. Cursos com mais de uma seção no .md pro mesmo código da Sophia (mesma
--    pós-graduação, turnos/modalidades diferentes) foram consolidados numa
--    descricao só. Casos consolidados: código 6 (Estética Avançada — juntei
--    "Pós Estética" + "Estética Presencial" + "Presencial Híbrida" +
--    "Semipresencial", nenhuma seção menciona profissão específica), código
--    89 (Farmácia Clínica — online ao vivo + EAD) e código 22 (Hematologia e
--    Hemoterapia — presencial + semipresencial).
-- 3. Código 53 (Residência em Estética Avançada): o .md tem duração
--    conflitante em duas seções (6 meses vs 4 meses). Usei 6 MESES — revise
--    e ajuste se estiver errado.
-- 4. Cursos "Pós Estética" específicos por profissão de base (Biologia 18,
--    Biomedicina 17, Enfermagem 20, Farmácia 19) NÃO foram preenchidos: o
--    .md não diferencia qual seção pertence a qual, então fiquei sem dado
--    confiável pra atribuir. Mesma coisa pra: Análises Clínicas Para
--    Graduandos (44), Estética para Graduandos (50), Curso Introdutório de
--    Circulação Extracorpórea (34), Drenagem Linfática Manual (35), ECMO
--    Básico (36), Fisioterapia (54), Lifting SS Face Lift (39), Lipo de
--    Papada Aspirativa (40), Microagulhamento Facial Corporal e Capilar (41)
--    — nenhum desses tem seção correspondente no .md.

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 580.00,
  descricao = 'Pós-graduação em Estética, com opções de turno presencial e semipresencial. Presencial (noturno ou diurno): duas vezes por semana, 60% de aulas práticas, 12 meses de duração — noturno das 19h30 às 22h00, diurno das 9h00 às 12h00; taxa de matrícula R$ 200,00, 20 parcelas de R$ 992,00. Presencial híbrida (noturno ou diurno): teoria 100% EAD com uma aula ao vivo por semana e práticas presenciais uma vez por semana, 12 meses de duração; taxa de matrícula R$ 200,00, 18 parcelas de R$ 580,00. Semipresencial: teoria EAD (vídeo aulas, slides, artigos) e 40% de práticas em um final de semana por mês (sábado e domingo, das 9h às 17h), 12 meses de duração; taxa de matrícula R$ 200,00, com opções de 14 parcelas de R$ 885,00, 18 parcelas de R$ 717,00 ou 20 parcelas de R$ 674,00.',
  atualizado_em = now()
where codigo_curso = 6;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 1200.00,
  descricao = 'Pós-graduação em Harmonização Orofacial (HOF), período mensal semipresencial — um sábado e um domingo por mês, das 9h00 às 17h00, com aulas online e presenciais, 12 meses de duração. Taxa de matrícula R$ 200,00, 20 parcelas de R$ 1.200,00.',
  atualizado_em = now()
where codigo_curso = 25;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 576.50,
  descricao = 'Pós-graduação em Análises Clínicas da Prática Laboratorial à Interpretação Clínica, curso modular com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Período semanal noturno (duas vezes por semana, das 19h30 às 22h40): taxa de matrícula R$ 200,00, com opções de 14 parcelas de R$ 760,00, 18 parcelas de R$ 610,00 ou 20 parcelas de R$ 576,50. Período mensal (um final de semana por mês, sábado e domingo, das 9h00 às 17h00): taxa de matrícula R$ 200,00, com opções de 24 parcelas de R$ 612,00, 20 parcelas de R$ 624,00 ou 18 parcelas de R$ 805,00. Duração de 12 meses.',
  atualizado_em = now()
where codigo_curso = 59;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 494.00,
  descricao = 'Pós-graduação em Análises Clínicas, modalidade EAD semipresencial, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Teóricas 100% EAD no horário do aluno, práticas presenciais (40%) em um final de semana por mês (sábado e domingo, das 9h às 17h), 12 meses de duração, curso modular. Taxa de matrícula R$ 200,00, com opções de 12 parcelas de R$ 680,00 ou 18 parcelas de R$ 494,00.',
  atualizado_em = now()
where codigo_curso = 29;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 627.00,
  descricao = 'Pós-graduação em Análises Clínicas Veterinária, período mensal — um final de semana por mês (sábado e domingo), das 9h00 às 17h00, presencial, 12 meses de duração, curso modular. Taxa de matrícula R$ 200,00, 20 parcelas de R$ 627,00.',
  atualizado_em = now()
where codigo_curso = 16;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 615.00,
  descricao = 'Pós-graduação em Citologia Clínica, período mensal — um final de semana por mês (sábado e domingo), das 9h00 às 17h00, 12 meses de duração, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Taxa de matrícula R$ 200,00, 24 parcelas de R$ 615,00.',
  atualizado_em = now()
where codigo_curso = 13;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 638.00,
  descricao = 'Pós-graduação em Citogenética Clínica, período mensal — um final de semana por mês (sábado e domingo), das 9h00 às 17h00, 12 meses de duração, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Necessita de pré-requisito de 16h. Taxa de matrícula R$ 200,00, 24 parcelas de R$ 638,00.',
  atualizado_em = now()
where codigo_curso = 24;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 165.00,
  descricao = 'Pós-graduação em Farmácia Clínica. Modalidade online ao vivo: período semanal noturno, duas vezes por semana, das 19h30 às 22h40, 12 meses de duração, turma modular; taxa de matrícula R$ 200,00, 18 parcelas de R$ 369,00. Modalidade EAD: conteúdo em plataforma digital (vídeo aulas, slides, artigos), 12 meses de duração, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios; taxa de matrícula R$ 200,00, 12 parcelas de R$ 165,00.',
  atualizado_em = now()
where codigo_curso = 89;

update curso_conteudo set
  duracao = '5 meses',
  preco_mensalidade = 200.00,
  descricao = 'Capacitação em Anatomia e Técnicas de Macroscopia de Alta Complexidade, aulas aos domingos quinzenais, das 9h00 às 17h00, 100% online com aulas ao vivo, 5 meses de duração. Taxa de matrícula R$ 100,00, com opções de 3 parcelas de R$ 400,00, 4 parcelas de R$ 300,00 ou 6 parcelas de R$ 200,00 no cartão de crédito sem juros.',
  atualizado_em = now()
where codigo_curso = 45;

update curso_conteudo set
  duracao = '5 meses',
  preco_mensalidade = 200.00,
  descricao = 'Capacitação em Anatomia e Técnicas de Macroscopia de Baixa e Média Complexidade, turma de domingos quinzenais, das 9h às 17h, 100% online com aulas ao vivo (ficam gravadas após a transmissão), 5 meses de duração. Taxa de matrícula R$ 100,00, com opções de 3 parcelas de R$ 400,00, 4 parcelas de R$ 300,00 ou 6 parcelas de R$ 200,00, todas no boleto.',
  atualizado_em = now()
where codigo_curso = 46;

-- Duração conflitante no .md (6 meses vs 4 meses) — usei 6 meses, revisar.
update curso_conteudo set
  duracao = '6 meses',
  preco_mensalidade = 450.00,
  descricao = 'Residência em Estética Avançada, frequência em fins de semana quinzenais (sábado e domingo, das 9h00 às 17h00), carga horária de 120 horas presenciais (15 encontros de 8 horas) mais bônus de 12 horas gravadas e 8 horas de workshop, totalizando 140 horas. Público-alvo: biomédicos, farmacêuticos, enfermeiros, fisioterapeutas, biólogos e dentistas já habilitados. Taxa de matrícula R$ 100,00, com opções de 6 parcelas de R$ 900,00 no boleto ou 12 parcelas de R$ 450,00 no crédito.',
  atualizado_em = now()
where codigo_curso = 53;

update curso_conteudo set
  duracao = '5 meses',
  preco_mensalidade = 183.33,
  descricao = 'Capacitação em Histotecnologia, 100% online com aulas ao vivo (ficam gravadas após a transmissão), período mensal — um sábado e domingo por mês, das 9h00 às 17h00, 5 meses de duração, certificado digital de 80 horas. Taxa de matrícula R$ 100,00, com opções de 3 parcelas de R$ 366,67, 4 parcelas de R$ 275,00 ou 6 parcelas de R$ 183,33.',
  atualizado_em = now()
where codigo_curso = 51;

update curso_conteudo set
  duracao = null,
  preco_mensalidade = 200.00,
  descricao = 'Atualização em Coleta de Materiais Biológicos e Interpretação de Exames Laboratoriais, sábado e domingo das 9h às 17h — presencial no sábado, online ao vivo no domingo. Certificado digital de 16 horas. Taxa de matrícula R$ 100,00, com opções de pagamento à vista de R$ 400,00 ou 2 parcelas de R$ 200,00 no boleto.',
  atualizado_em = now()
where codigo_curso = 32;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 440.00,
  descricao = 'Pós-graduação em Farmácia Hospitalar em Oncologia, período mensal — um final de semana por mês (sábado e domingo), das 9h00 às 17h00, 12 meses de duração, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Curso online, com aulas ao vivo que ficam gravadas na plataforma. Inclui estágio de 12 horas no ICESP. Taxa de matrícula R$ 200,00, 20 parcelas de R$ 440,00.',
  atualizado_em = now()
where codigo_curso = 23;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 634.00,
  descricao = 'Pós-graduação em Biologia Molecular, semipresencial, com aulas teóricas online (ao vivo) e práticas presenciais, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Período semanal noturno (duas vezes por semana, das 19h30 às 22h40): taxa de matrícula R$ 200,00, 18 parcelas de R$ 776,00. Período mensal (um final de semana por mês, sábado e domingo, das 9h00 às 17h00): taxa de matrícula R$ 200,00, 24 parcelas de R$ 634,00. Duração de 12 meses.',
  atualizado_em = now()
where codigo_curso = 27;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 638.00,
  descricao = 'Pós-graduação em Microbiologia Clínica, período mensal — um final de semana por mês (sábado e domingo), das 9h00 às 17h00, 12 meses de duração, curso presencial híbrido com aulas teóricas online conforme cronograma e práticas presenciais, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Taxa de matrícula R$ 200,00, 24 parcelas de R$ 638,00.',
  atualizado_em = now()
where codigo_curso = 21;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 270.00,
  descricao = 'Pós-graduação em Administração Hospitalar, turma mensal, aulas em um final de semana por mês (sábado e domingo), das 9h00 às 17h00, totalmente online (parte EAD e parte ao vivo), 12 meses de duração, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Taxa de matrícula R$ 200,00, com opções de 14 parcelas de R$ 337,00 ou 18 parcelas de R$ 270,00.',
  atualizado_em = now()
where codigo_curso = 14;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 270.00,
  descricao = 'Pós-graduação em Auditoria nos Serviços de Saúde, turma mensal, aulas em um final de semana por mês (sábado e domingo), das 9h00 às 17h00, totalmente online (parte EAD e parte ao vivo), 12 meses de duração, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Taxa de matrícula R$ 200,00, com opções de 14 parcelas de R$ 337,00 ou 18 parcelas de R$ 270,00.',
  atualizado_em = now()
where codigo_curso = 15;

update curso_conteudo set
  duracao = '18 meses',
  preco_mensalidade = 510.00,
  descricao = 'Pós-graduação em Acupuntura, mensal — um final de semana por mês (sábado e domingo), das 9h00 às 17h00, com algumas aulas online gravadas na plataforma, curso totalmente presencial, 18 meses de duração. Taxa de matrícula R$ 200,00, 24 parcelas de R$ 510,00.',
  atualizado_em = now()
where codigo_curso = 56;

update curso_conteudo set
  duracao = 'Modular semestral',
  preco_mensalidade = 150.00,
  descricao = 'Graduação em Gestão Hospitalar, turma noturna, curso modular semestral (módulos interdependentes), aulas de segunda a quinta presenciais das 19h às 22h30 e sexta-feira online a cada 15 dias. Necessário processo seletivo para ingresso. Início previsto para fevereiro/2026. Taxa de matrícula R$ 100,00, 30 parcelas de R$ 150,00.',
  atualizado_em = now()
where codigo_curso = 31;

update curso_conteudo set
  duracao = null,
  preco_mensalidade = 140.00,
  descricao = 'Capacitação em Controle de Qualidade nos Laboratórios de Análises Clínicas, 4 aulas em 2 finais de semana (sábado e domingo, das 9h às 17h), com intervalo de 15 dias entre eles, online ao vivo (aulas ficam gravadas por 20 dias na plataforma). Taxa de matrícula R$ 100,00, com opções de 2 parcelas de R$ 350,00 no boleto ou 5 parcelas de R$ 140,00 sem juros no cartão de crédito.',
  atualizado_em = now()
where codigo_curso = 49;

update curso_conteudo set
  duracao = '1 final de semana (16h)',
  preco_mensalidade = 399.00,
  descricao = 'Capacitação em Líquidos Cavitários e Liquor, 2 aulas (16 horas) em 1 final de semana — sábado com aula teórica online ao vivo e domingo com aula prática, das 9h às 17h (teóricas ficam gravadas por 20 dias na plataforma). Taxa de matrícula R$ 100,00, 2 parcelas de R$ 399,00 no boleto.',
  atualizado_em = now()
where codigo_curso = 43;

update curso_conteudo set
  duracao = '2 dias (sábado e domingo)',
  preco_mensalidade = 235.00,
  descricao = 'Atualização em Espermograma, sábado das 9h às 17h e domingo das 9h às 13h, presencial em dois dias. Taxa de matrícula R$ 100,00, 2 parcelas de R$ 470,00 no boleto ou em até 5 parcelas sem juros no cartão de crédito.',
  atualizado_em = now()
where codigo_curso = 33;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 416.00,
  descricao = 'Pós-graduação em Ressonância Magnética e Tomografia Computadorizada, modalidade semipresencial, período mensal — teoria online e práticas em um final de semana por mês (sábado e domingo, das 9h às 17h), 12 meses de duração, com estágio presencial de 70 horas. Início imediato com módulo pré-requisito 100% online, curso modular. Taxa de matrícula R$ 200,00, 20 parcelas de R$ 416,00.',
  atualizado_em = now()
where codigo_curso = 30;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 490.00,
  descricao = 'Pós-graduação em Hematologia e Hemoterapia, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Presencial, período semanal noturno (duas vezes por semana, das 19h30 às 22h40): taxa de matrícula R$ 200,00, com opções de 14 parcelas de R$ 870,00, 18 parcelas de R$ 670,00 ou 20 parcelas de R$ 629,00. Presencial, período mensal (um final de semana por mês, sábado e domingo, das 9h00 às 17h00): taxa de matrícula R$ 200,00, com opções de 18 parcelas de R$ 766,00, 20 parcelas de R$ 722,00 ou 24 parcelas de R$ 629,00. Semipresencial (teoria online gravada por módulos + práticas em um final de semana por mês, das 9h às 17h): taxa de matrícula R$ 200,00, com opções de 14 parcelas de R$ 648,00, 18 parcelas de R$ 522,00 ou 20 parcelas de R$ 490,00. Duração de 12 meses.',
  atualizado_em = now()
where codigo_curso = 22;

update curso_conteudo set
  duracao = '18 meses',
  preco_mensalidade = 1676.00,
  descricao = 'Pós-graduação em Circulação Extracorpórea, período mensal, presencial com algumas aulas online, aulas em 1 final de semana por mês (sábado e domingo, das 9h às 17h). Carga horária total de 1.200h, sendo 800h de estágio supervisionado em instituições parceiras. Duração de 18 meses. Taxa de matrícula R$ 200,00, 21 parcelas de R$ 1.676,00 (há outros planos de pagamento disponíveis além deste).',
  atualizado_em = now()
where codigo_curso = 28;

update curso_conteudo set
  duracao = '12 meses',
  preco_mensalidade = 519.00,
  descricao = 'Pós-graduação em Imunologia e Oncohematologia por Citometria de Fluxo, período mensal, aulas em 1 final de semana por mês (sábado e domingo, das 9h às 17h), 12 meses de duração, curso modular, com início imediato e liberação de um curso de gestão de tempo ou controle de qualidade nos laboratórios. Taxa de matrícula R$ 200,00, com opções de 24 parcelas de R$ 519,00 ou 18 parcelas de R$ 632,50.',
  atualizado_em = now()
where codigo_curso = 26;

update curso_conteudo set
  duracao = '2 meses e meio',
  preco_mensalidade = 325.00,
  descricao = 'Capacitação Auxiliar de Médico Veterinário, 100 horas de carga horária (60h de teoria EAD e 40h de estágio), 2 meses e meio de duração, início imediato. Estágio em Osasco, de segunda a sábado, das 9h às 17h. Taxa de matrícula R$ 100,00, valor total de R$ 1.300,00, em 4 parcelas de R$ 325,00.',
  atualizado_em = now()
where codigo_curso = 47;

update curso_conteudo set
  duracao = '4 meses',
  preco_mensalidade = 291.00,
  descricao = 'Capacitação em Citologia Hematológica, modalidade presencial, período quinzenal — um domingo a cada 15 dias, 4 meses de duração. Taxa de matrícula R$ 100,00, com opções de 4 parcelas de R$ 437,00 no boleto ou 6 parcelas de R$ 291,00 no boleto ou cartão de crédito sem juros.',
  atualizado_em = now()
where codigo_curso = 48;

update curso_conteudo set
  duracao = '4 meses',
  preco_mensalidade = 308.65,
  descricao = 'Capacitação em PCR em Tempo Real, 100% presencial, período de domingos quinzenais (1 domingo a cada 15 dias), das 9h às 17h, 4 meses de duração. Taxa de matrícula R$ 100,00, valor total de R$ 1.850,00, com opções de 4 parcelas de R$ 462,50 ou 6 parcelas de R$ 308,65.',
  atualizado_em = now()
where codigo_curso = 52;

-- "Fios de PDO" no .md = fios absorvíveis (polidioxanona) faciais.
update curso_conteudo set
  duracao = '1 dia (sábado)',
  preco_mensalidade = 300.00,
  descricao = 'Atualização em Fios de PDO, carga horária de 8h em 1 sábado (teoria pela manhã, prática à tarde), até 3 modelos por aluno, das 9h às 17h. Taxa de matrícula R$ 100,00, valor total de R$ 1.800,00 à vista, 2 parcelas de R$ 900,00 no boleto, ou 6 parcelas de R$ 300,00 no cartão de crédito (6 parcelas de R$ 270,00 para alunos e ex-alunos de Estética do IPESSP, com 10% de desconto).',
  atualizado_em = now()
where codigo_curso = 37;

update curso_conteudo set
  duracao = '1 dia (sábado)',
  preco_mensalidade = 475.00,
  descricao = 'Toxina Botulínica Aplicada Full Face, carga horária de 10h em 1 sábado (teoria pela manhã, prática à tarde), até 1 modelo por aluno, das 8h às 18h. Taxa de matrícula R$ 100,00, valor total de R$ 1.900,00 (R$ 1.800,00 à vista), 4 parcelas de R$ 475,00 no cartão de crédito (4 parcelas de R$ 450,00 para alunos e ex-alunos de Estética do IPESSP, com 10% de desconto).',
  atualizado_em = now()
where codigo_curso = 42;

update curso_conteudo set
  duracao = '1 dia (sábado)',
  preco_mensalidade = 500.00,
  descricao = 'Atualização em Intradermoterapia (Enzimas), carga horária de 8h em 1 sábado, das 9h00 às 17h00 (teoria pela manhã, prática à tarde). Aborda enzimas faciais e corporais. 2 parcelas de R$ 500,00.',
  atualizado_em = now()
where codigo_curso = 38;
