import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SyncLog } from './entities/sync-log.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { RecivModule } from '../receiv/receiv.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SyncLog]),
    SophiaModule,
    RecivModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
