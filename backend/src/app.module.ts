import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { SophiaModule } from './sophia/sophia.module';
import { SyncModule } from './sync/sync.module';
import { EmailModule } from './email/email.module';
import { IaModule } from './ia/ia.module';
import { LeadsModule } from './leads/leads.module';
import { FormulariosModule } from './formularios/formularios.module';
import { EmailLog } from './email/entities/email-log.entity';
import { ResponsavelCache } from './ia/entities/responsavel-cache.entity';
import { Lead } from './leads/entities/lead.entity';
import { MensagemContato } from './formularios/entities/mensagem-contato.entity';
import { Manifestacao } from './formularios/entities/manifestacao.entity';
import { SolicitacaoEvento } from './formularios/entities/solicitacao-evento.entity';

@Module({
  controllers: [AppController],
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
        entities: [EmailLog, ResponsavelCache, Lead, MensagemContato, Manifestacao, SolicitacaoEvento],
        synchronize: true,
      }),
    }),
    SophiaModule,
    SyncModule,
    EmailModule,
    IaModule,
    LeadsModule,
    FormulariosModule,
  ],
})
export class AppModule {}
