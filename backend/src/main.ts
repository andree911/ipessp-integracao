import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL não configurada — aplicação não pode iniciar',
    );
  }

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  const origensPermitidas = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origensPermitidas.length > 0 ? origensPermitidas : false,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Serviço de integração rodando na porta ${port}`);
}
bootstrap().catch((err: unknown) => {
  new Logger('Bootstrap').error(
    `Falha ao iniciar a aplicação: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(1);
});
