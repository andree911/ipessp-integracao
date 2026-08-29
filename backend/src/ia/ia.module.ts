import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { EmailModule } from '../email/email.module';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { IaBearerGuard } from './ia.guard';
import { ResponsavelCache } from './entities/responsavel-cache.entity';
import { TelefoneCpfCache } from './entities/telefone-cpf-cache.entity';
import { Aviso } from './entities/aviso.entity';
import { CalendarioEvento } from './entities/calendario.entity';
import { CursoConteudo } from './entities/curso-conteudo.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ResponsavelCache,
      TelefoneCpfCache,
      Aviso,
      CalendarioEvento,
      CursoConteudo,
    ]),
    SophiaModule,
    FinanceiroModule,
    EmailModule,
  ],
  controllers: [IaController],
  providers: [IaService, IaBearerGuard],
  exports: [TypeOrmModule, IaService],
})
export class IaModule {}
