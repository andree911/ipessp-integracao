import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SophiaModule } from '../sophia/sophia.module';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResponsavelCache]),
    SophiaModule,
  ],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
