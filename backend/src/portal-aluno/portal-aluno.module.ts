import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortalAlunoRefreshToken } from './entities/portal-aluno-refresh-token.entity';
import { ClienteCache } from '../financeiro/entities/cliente-cache.entity';
import { PortalAlunoAuthService } from './portal-aluno-auth.service';
import { PortalAlunoDadosService } from './portal-aluno-dados.service';
import { PortalAlunoAuthController } from './portal-aluno-auth.controller';
import { PortalAlunoDadosController } from './portal-aluno-dados.controller';
import { PortalAlunoGuard } from './portal-aluno.guard';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { StorageService } from '../common/storage.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PortalAlunoRefreshToken, ClienteCache]),
    SophiaModule,
    FinanceiroModule,
  ],
  controllers: [PortalAlunoAuthController, PortalAlunoDadosController],
  providers: [PortalAlunoAuthService, PortalAlunoDadosService, PortalAlunoGuard, StorageService],
})
export class PortalAlunoModule {}
