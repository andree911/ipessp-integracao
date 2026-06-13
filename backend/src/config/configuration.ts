export default () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  sophia: {
    baseUrl: process.env.SOPHIA_BASE_URL ?? '',
    token: process.env.SOPHIA_TOKEN ?? '',
    tenant: process.env.SOPHIA_TENANT ?? '',
  },
  receiv: {
    baseUrl: process.env.RECEIV_BASE_URL ?? '',
    jwtSecret: process.env.RECEIV_JWT_SECRET ?? '',
    jwtIss: process.env.RECEIV_JWT_ISS ?? '',
    jwtIst: process.env.RECEIV_JWT_IST ?? '',
    codigoCredor: parseInt(process.env.RECEIV_CODIGO_CREDOR ?? '0', 10),
  },
  database: {
    path: process.env.DATABASE_PATH ?? './data/sync.db',
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
  },
});
