import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SophiaModule } from '../sophia/sophia.module';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';
import { AdminApiKeyGuard } from '../admin/guards/admin-api-key.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResponsavelCache]),
    SophiaModule,
    FinanceiroModule,
  ],
  controllers: [SyncController],
  providers: [SyncService, AdminApiKeyGuard],
  exports: [SyncService],
})
export class SyncModule {}
