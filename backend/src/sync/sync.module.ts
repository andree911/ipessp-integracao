import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncLog } from './entities/sync-log.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { RecivModule } from '../receiv/receiv.module';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncLog, ResponsavelCache]),
    SophiaModule,
    RecivModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
