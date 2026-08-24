export default () => ({
  sophia: {
    baseUrl: process.env.SOPHIA_BASE_URL ?? '',
    usuario: process.env.SOPHIA_USUARIO ?? '',
    senha: process.env.SOPHIA_SENHA ?? '',
    tenant: process.env.SOPHIA_TENANT ?? '',
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
    // Supabase (origem antiga) exige SSL; o Postgres da VPS não tem SSL
    // configurado -- default true preserva o comportamento anterior pra
    // quem ainda não setou a var.
    ssl: process.env.DATABASE_SSL !== 'false',
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET ?? '',
    // Secret do webhook do canal "financeiro" (2ª instância Z-API, ver
    // zapi.financeiro acima) -- separado do WEBHOOK_SECRET de cima de
    // propósito, cada instância Z-API tem sua própria URL cadastrada.
    secretFinanceiro: process.env.WEBHOOK_SECRET_FINANCEIRO ?? '',
  },
  ia: {
    bearerToken: process.env.IA_BEARER_TOKEN ?? '',
  },
  // Storage S3-compatível (MinIO na VPS), substitui o Supabase Storage.
  minio: {
    endpoint: process.env.MINIO_ENDPOINT ?? 'minio',
    port: parseInt(process.env.MINIO_PORT ?? '9000', 10),
    useSsl: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY ?? '',
    secretKey: process.env.MINIO_SECRET_KEY ?? '',
    // Base pública servida pelo Traefik (rota /files/*), ex: https://srv1892430.hstgr.cloud/files
    publicBaseUrl: (process.env.MINIO_PUBLIC_BASE_URL ?? '').replace(/\/$/, ''),
  },
  email: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? '',
    // Remetente exclusivo do e-mail de cancelamento — o SMTP_FROM padrão
    // continua recebendo cópia (CC) automaticamente, ver enviarCancelamento().
    cancelamentoFrom: process.env.EMAIL_CANCELAMENTO_FROM ?? '',
    cancelamentoCcPedagogico:
      process.env.EMAIL_CANCELAMENTO_CC_PEDAGOGICO ?? '',
    cancelamentoCcTrancamento:
      process.env.EMAIL_CANCELAMENTO_CC_TRANCAMENTO ?? '',
    cancelamentoCcFinanceiro:
      process.env.EMAIL_CANCELAMENTO_CC_FINANCEIRO ?? '',
    // CC do comercial nos e-mails de cobrança (tipo 'cobranca_*', pós-vencimento) —
    // não se aplica a lembrete/vencimento_hoje/aviso/renegociação.
    ccComercial: process.env.EMAIL_CC_COMERCIAL ?? '',
    nomeEscola: process.env.ESCOLA_NOME ?? 'Escola',
    telefoneEscola: process.env.ESCOLA_TELEFONE ?? '',
    diasAntes: (process.env.EMAIL_DIAS_ANTES ?? '7,5,3,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasAviso: (process.env.EMAIL_DIAS_AVISO ?? '10,9,8,7,6,4,3,2,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasAposVencimento: (
      process.env.EMAIL_DIAS_APOS ?? '1,2,3,7,8,9,10,12,15,20,25,30'
    )
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasRenegociacaoOverlap: (
      process.env.EMAIL_DIAS_RENEGOCIACAO_OVERLAP ?? '1,3,7'
    )
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    logoUrl: process.env.EMAIL_LOGO_URL ?? '',
    cronHabilitado: process.env.EMAIL_CRON_HABILITADO ?? 'false',
    // Restringe o job real aos tipos com boleto/PIX embutido (lembrete_*,
    // cobranca_*, vencimento_hoje) -- pula aviso_*/renegociacao_*. Liga
    // "somente cobrança" sem precisar desligar o cron inteiro.
    somenteComCodigo: process.env.EMAIL_SOMENTE_COM_CODIGO ?? 'false',
    siteUrl: process.env.ESCOLA_SITE ?? '',
    // Domínio do site-ipessp-frontend (hero images e ícones dos templates de
    // email) — é um deploy separado do ESCOLA_SITE institucional acima.
    assetsBaseUrl: (process.env.EMAIL_ASSETS_BASE_URL ?? '').replace(/\/$/, ''),
    instagramUrl: process.env.ESCOLA_INSTAGRAM ?? '',
    facebookUrl: process.env.ESCOLA_FACEBOOK ?? '',
    youtubeUrl: process.env.ESCOLA_YOUTUBE ?? '',
    linkedinUrl: process.env.ESCOLA_LINKEDIN ?? '',
    cnpj: process.env.ESCOLA_CNPJ ?? '',
    endereco: process.env.ESCOLA_ENDERECO ?? '',
    emailNotificacoes: process.env.ESCOLA_EMAIL_NOTIFICACOES ?? '',
    linkPortalAluno: process.env.EMAIL_PORTAL_ALUNO_URL ?? '',
  },
  zapi: {
    instanceId: process.env.ZAPI_INSTANCE_ID ?? '',
    token: process.env.ZAPI_TOKEN ?? '',
    clientToken: process.env.ZAPI_CLIENT_TOKEN ?? '',
    telefoneFinanceiro: process.env.ZAPI_TELEFONE_FINANCEIRO ?? '',
    // Avisado por WhatsApp quando o chatbot encaminha um atendimento de secretaria
    // pra humano (ver IaService.encaminharHumano) — mesmo padrão de telefoneFinanceiro acima.
    telefoneSecretaria: process.env.ZAPI_TELEFONE_SECRETARIA ?? '',
    // Consultoras de marketing avisadas por WhatsApp assim que a IA registra um
    // lead novo — e também quando o chatbot encaminha um interessado que ainda
    // não é aluno (setor 'comercial' em IaService.encaminharHumano).
    telefonesConsultorasMarketing: (
      process.env.ZAPI_TELEFONES_CONSULTORAS_MARKETING ?? ''
    )
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    cronHabilitado: process.env.WPP_CRON_HABILITADO ?? 'false',
    diasAntes: (process.env.WPP_DIAS_ANTES ?? '7,5,3,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasApos: (process.env.WPP_DIAS_APOS ?? '1,2,3,7,8,9,10,12,15,20')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    // Mesmo par usado hoje só pelo "Filtro Modo Teste" do n8n -- precisa
    // existir também aqui porque o webhook da Z-API passou a bater primeiro
    // no backend (ver WhatsAppWebhookController), não mais direto no n8n.
    modoTeste: process.env.ZAPI_MODO_TESTE ?? 'false',
    telefoneTeste: process.env.ZAPI_TELEFONE_TESTE ?? '',
    // URL do fluxo "Encaminhar Leads" no n8n -- tudo que não for resposta de
    // opção de cobrança é repassado pra cá sem alteração, pra não quebrar o
    // encaminhamento de lead que já funciona hoje.
    n8nWebhookUrl: process.env.N8N_WHATSAPP_WEBHOOK_URL ?? '',
    // Banners anexados nas mensagens do job de cobrança do WhatsApp (wpp_job)
    // -- URL pública no MinIO da VPS. "Lembrete" vai nas mensagens antes/no
    // dia do vencimento; "Cobrança" vai nas de atraso (pós-vencimento). Cada
    // imagem é baixada uma vez por rodada do job e reenviada pra cada
    // destinatário, não por lançamento. Vazio = recurso desligado pra aquele
    // tipo (comportamento atual, só texto/lista).
    imagemLembreteUrl: process.env.WPP_IMAGEM_LEMBRETE_URL ?? '',
    imagemLembreteLegenda: process.env.WPP_IMAGEM_LEMBRETE_LEGENDA ?? '',
    imagemCobrancaUrl: process.env.WPP_IMAGEM_COBRANCA_URL ?? '',
    imagemCobrancaLegenda: process.env.WPP_IMAGEM_COBRANCA_LEGENDA ?? '',
    // Segunda instância Z-API, número dedicado só pra cobrança -- separa o
    // canal de cobrança do número de atendimento/chatbot acima. Todo envio do
    // whatsapp-job (wpp_job) usa este canal; o resto (respostas do chatbot,
    // boleto sob demanda em IaService) continua no canal "geral" por padrão,
    // já que faz parte da mesma conversa que começou no número de atendimento.
    // Vazio = canal "financeiro" ainda não configurado (WhatsAppService loga
    // aviso/lança erro igual já faz hoje quando falta instanceId/token).
    financeiro: {
      instanceId: process.env.ZAPI_FINANCEIRO_INSTANCE_ID ?? '',
      token: process.env.ZAPI_FINANCEIRO_TOKEN ?? '',
      clientToken: process.env.ZAPI_FINANCEIRO_CLIENT_TOKEN ?? '',
    },
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      (() => {
        throw new Error('JWT_SECRET env var is required');
      })(),
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY ?? '',
  },
  backendUrl: process.env.BACKEND_URL ?? '',
});
