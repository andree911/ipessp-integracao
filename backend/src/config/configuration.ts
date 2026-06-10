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
});
