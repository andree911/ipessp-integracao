import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from './config/configuration';
import { SophiaModule } from './sophia/sophia.module';
import { SyncModule } from './sync/sync.module';
import { EmailModule } from './email/email.module';
import { IaModule } from './ia/ia.module';
import { LeadsModule } from './leads/leads.module';
import { FormulariosModule } from './formularios/formularios.module';
import { CandidaturasModule } from './candidaturas/candidaturas.module';
import { AdminModule } from './admin/admin.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { TiModule } from './ti/ti.module';
import { MatriculasModule } from './matriculas/matriculas.module';
import { MercadoPagoModule } from './mercadopago/mercadopago.module';
import { PortalAlunoModule } from './portal-aluno/portal-aluno.module';
import { PortalAlunoRefreshToken } from './portal-aluno/entities/portal-aluno-refresh-token.entity';
import { Chamado } from './ti/entities/chamado.entity';
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
import { MatriculaCache } from './matriculas/entities/matricula-cache.entity';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get<string>('database.url'),
        entities: [
          EmailLog, ResponsavelCache, TelefoneCpfCache, Lead, LeadHistorico, MensagemContato, Manifestacao,
          SolicitacaoEvento, Candidatura, ClienteCache, LancamentoCache, Chamado, MatriculaCache,
          PortalAlunoRefreshToken,
        ],
        synchronize: false,
        ssl: { rejectUnauthorized: false },
        extra: { max: 10, idleTimeoutMillis: 30000, connectionTimeoutMillis: 5000 },
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
    AdminModule,
    TiModule,
    MatriculasModule,
    MercadoPagoModule,
    PortalAlunoModule,
  ],
})
export class AppModule {}
