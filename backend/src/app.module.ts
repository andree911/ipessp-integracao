import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { SophiaModule } from './sophia/sophia.module';
import { RecivModule } from './receiv/receiv.module';
import { SyncModule } from './sync/sync.module';
import { WebhookModule } from './webhook/webhook.module';
import { EmailModule } from './email/email.module';
import { SyncLog } from './sync/entities/sync-log.entity';
import { EmailLog } from './email/entities/email-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'better-sqlite3',
        database: config.get<string>('database.path') ?? './data/sync.db',
        entities: [SyncLog, EmailLog],
        synchronize: true,
      }),
    }),
    SophiaModule,
    RecivModule,
    SyncModule,
    WebhookModule,
    EmailModule,
  ],
})
export class AppModule {}
