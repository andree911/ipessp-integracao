import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalAlunoConta } from './entities/portal-aluno-conta.entity';
import { PortalAlunoRefreshToken } from './entities/portal-aluno-refresh-token.entity';
import { PortalAlunoResetToken } from './entities/portal-aluno-reset-token.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { PortalAlunoAuthService } from './portal-aluno-auth.service';
import { PortalAlunoDadosService } from './portal-aluno-dados.service';
import { PortalAlunoAuthController } from './portal-aluno-auth.controller';
import { PortalAlunoDadosController } from './portal-aluno-dados.controller';
import { PortalAlunoGuard } from './portal-aluno.guard';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortalAlunoConta, PortalAlunoRefreshToken, PortalAlunoResetToken, ClienteCache]),
    SophiaModule,
    FinanceiroModule,
    EmailModule,
  ],
  controllers: [PortalAlunoAuthController, PortalAlunoDadosController],
  providers: [PortalAlunoAuthService, PortalAlunoDadosService, PortalAlunoGuard],
})
export class PortalAlunoModule {}
