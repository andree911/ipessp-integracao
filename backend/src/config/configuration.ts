export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
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
  sync: {
    cron: process.env.SYNC_CRON ?? '0 * * * *',
    lookbackDays: parseInt(process.env.SYNC_LOOKBACK_DAYS ?? '30', 10),
  },
  webhook: {
    secret: process.env.WEBHOOK_SECRET ?? '',
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
    // Base pública servida pelo Caddy (rota /files/*), ex: https://srv1835634.hstgr.cloud/files
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
    cancelamentoCcPedagogico: process.env.EMAIL_CANCELAMENTO_CC_PEDAGOGICO ?? '',
    cancelamentoCcTrancamento: process.env.EMAIL_CANCELAMENTO_CC_TRANCAMENTO ?? '',
    cancelamentoCcFinanceiro: process.env.EMAIL_CANCELAMENTO_CC_FINANCEIRO ?? '',
    nomeEscola: process.env.ESCOLA_NOME ?? 'Escola',
    telefoneEscola: process.env.ESCOLA_TELEFONE ?? '',
    diasAntes: (process.env.EMAIL_DIAS_ANTES ?? '7,5,3,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasAviso: (process.env.EMAIL_DIAS_AVISO ?? '10,9,8,7,6,4,3,2,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasAposVencimento: (process.env.EMAIL_DIAS_APOS ?? '1,2,3,7,8,9,10,12,15,20,25,30')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasRenegociacaoOverlap: (process.env.EMAIL_DIAS_RENEGOCIACAO_OVERLAP ?? '1,3,7')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    logoUrl: process.env.EMAIL_LOGO_URL ?? '',
    cronHabilitado: process.env.EMAIL_CRON_HABILITADO ?? 'false',
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
  n8n: {
    leadsWebhookUrl: process.env.N8N_LEADS_WEBHOOK_URL ?? '',
  },
  zapi: {
    instanceId: process.env.ZAPI_INSTANCE_ID ?? '',
    token: process.env.ZAPI_TOKEN ?? '',
    clientToken: process.env.ZAPI_CLIENT_TOKEN ?? '',
    telefoneFinanceiro: process.env.ZAPI_TELEFONE_FINANCEIRO ?? '',
    // Consultoras de marketing avisadas por WhatsApp assim que a IA registra um lead novo
    telefonesConsultorasMarketing: (process.env.ZAPI_TELEFONES_CONSULTORAS_MARKETING ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    cronHabilitado: process.env.WPP_CRON_HABILITADO ?? 'false',
    // Toggle separado do de cobrança acima — nutrição de lead e lembrete
    // financeiro são jobs distintos, cada um liga/desliga sozinho
    leadNurturingCronHabilitado: process.env.LEAD_WPP_CRON_HABILITADO ?? 'false',
    diasAntes: (process.env.WPP_DIAS_ANTES ?? '7,5,3,1')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    diasApos: (process.env.WPP_DIAS_APOS ?? '1,2,3,7,8,9,10,12,15,20')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
  },
  jwt: {
    secret: process.env.JWT_SECRET || (() => { throw new Error('JWT_SECRET env var is required'); })(),
    siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY ?? '',
  },
  backendUrl: process.env.BACKEND_URL ?? '',
  mercadopago: {
    accessToken: process.env.MP_ACCESS_TOKEN ?? '',
    sandbox: process.env.MP_SANDBOX !== 'false',
    successUrl: process.env.MP_SUCCESS_URL ?? '',
    failureUrl: process.env.MP_FAILURE_URL ?? '',
    pendingUrl: process.env.MP_PENDING_URL ?? '',
    notificationUrl: process.env.MP_NOTIFICATION_URL ?? '',
    webhookSecret: process.env.MP_WEBHOOK_SECRET ?? '',
  },
});
