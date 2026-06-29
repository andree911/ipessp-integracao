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
  supabase: {
    url: process.env.SUPABASE_URL ?? '',
    key: process.env.SUPABASE_SERVICE_KEY ?? '',
  },
  email: {
    host: process.env.SMTP_HOST ?? '',
    port: parseInt(process.env.SMTP_PORT ?? '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.SMTP_FROM ?? '',
    nomeEscola: process.env.ESCOLA_NOME ?? 'Escola',
    telefoneEscola: process.env.ESCOLA_TELEFONE ?? '',
    diasAntes: parseInt(process.env.EMAIL_DIAS_ANTES ?? '3', 10),
    diasAposVencimento: (process.env.EMAIL_DIAS_APOS ?? '1,3,7')
      .split(',')
      .map((d) => parseInt(d.trim(), 10)),
    logoUrl: process.env.EMAIL_LOGO_URL ?? '',
    cronHabilitado: process.env.EMAIL_CRON_HABILITADO ?? 'false',
    siteUrl: process.env.ESCOLA_SITE ?? '',
    instagramUrl: process.env.ESCOLA_INSTAGRAM ?? '',
    facebookUrl: process.env.ESCOLA_FACEBOOK ?? '',
    youtubeUrl: process.env.ESCOLA_YOUTUBE ?? '',
    linkedinUrl: process.env.ESCOLA_LINKEDIN ?? '',
    cnpj: process.env.ESCOLA_CNPJ ?? '',
    endereco: process.env.ESCOLA_ENDERECO ?? '',
    emailNotificacoes: process.env.ESCOLA_EMAIL_NOTIFICACOES ?? '',
  },
  n8n: {
    leadsWebhookUrl: process.env.N8N_LEADS_WEBHOOK_URL ?? '',
  },
  zapi: {
    instanceId: process.env.ZAPI_INSTANCE_ID ?? '',
    token: process.env.ZAPI_TOKEN ?? '',
    clientToken: process.env.ZAPI_CLIENT_TOKEN ?? '',
    cronHabilitado: process.env.WPP_CRON_HABILITADO ?? 'false',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'change-me-in-production',
    siteUrl: process.env.SITE_URL ?? 'http://localhost:3000',
  },
  admin: {
    apiKey: process.env.ADMIN_API_KEY ?? '',
  },
  mercadopago: {
    accessToken: process.env.MP_ACCESS_TOKEN ?? '',
    sandbox: process.env.MP_SANDBOX !== 'false',
    successUrl: process.env.MP_SUCCESS_URL ?? '',
    failureUrl: process.env.MP_FAILURE_URL ?? '',
    pendingUrl: process.env.MP_PENDING_URL ?? '',
    notificationUrl: process.env.MP_NOTIFICATION_URL ?? '',
  },
});
