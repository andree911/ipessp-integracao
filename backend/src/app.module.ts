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
import { CandidaturasModule } from './candidaturas/candidaturas.module';
import { AuthModule } from './auth/auth.module';
import { MeModule } from './me/me.module';
import { AdminModule } from './admin/admin.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { ClienteCache } from './financeiro/entities/cliente-cache.entity';
import { LancamentoCache } from './financeiro/entities/lancamento-cache.entity';
import { EmailLog } from './email/entities/email-log.entity';
import { ResponsavelCache } from './ia/entities/responsavel-cache.entity';
import { TelefoneCpfCache } from './ia/entities/telefone-cpf-cache.entity';
import { Lead } from './leads/entities/lead.entity';
import { LeadHistorico } from './leads/entities/lead-historico.entity';
import { MensagemContato } from './formularios/entities/mensagem-contato.entity';
import { Manifestacao } from './formularios/entities/manifestacao.entity';
import { SolicitacaoEvento } from './formularios/entities/solicitacao-evento.entity';
import { Candidatura } from './candidaturas/entities/candidatura.entity';
import { Usuario } from './auth/entities/usuario.entity';
import { Professor } from './auth/entities/professor.entity';
import { RefreshToken } from './auth/entities/refresh-token.entity';
import { ResetToken } from './auth/entities/reset-token.entity';

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
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: [
          EmailLog, ResponsavelCache, TelefoneCpfCache, Lead, LeadHistorico, MensagemContato, Manifestacao,
          SolicitacaoEvento, Candidatura, Usuario, Professor, RefreshToken, ResetToken,
          ClienteCache, LancamentoCache,
        ],
        synchronize: true,
        ssl: { rejectUnauthorized: false },
      }),
    }),
    SophiaModule,
    SyncModule,
    EmailModule,
    IaModule,
    FinanceiroModule,
    LeadsModule,
    FormulariosModule,
    CandidaturasModule,
    AuthModule,
    MeModule,
    AdminModule,
  ],
})
export class AppModule {}
