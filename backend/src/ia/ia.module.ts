import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SophiaModule } from '../sophia/sophia.module';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { IaBearerGuard } from './ia.guard';
import { SupabaseService } from './supabase.service';
import { ResponsavelCache } from './entities/responsavel-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ResponsavelCache]), SophiaModule],
  controllers: [IaController],
  providers: [IaService, IaBearerGuard, SupabaseService],
  exports: [TypeOrmModule],
})
export class IaModule {}
