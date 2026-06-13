import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { SophiaModule } from './sophia/sophia.module';
import { SyncModule } from './sync/sync.module';
import { EmailModule } from './email/email.module';
import { IaModule } from './ia/ia.module';
import { EmailLog } from './email/entities/email-log.entity';
import { ResponsavelCache } from './ia/entities/responsavel-cache.entity';

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
        entities: [EmailLog, ResponsavelCache],
        synchronize: true,
      }),
    }),
    SophiaModule,
    SyncModule,
    EmailModule,
    IaModule,
  ],
})
export class AppModule {}
