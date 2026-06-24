import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chamado } from './entities/chamado.entity';
import { TiService } from './ti.service';
import { TiController } from './ti.controller';
import { IaBearerGuard } from '../ia/ia.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Chamado])],
  controllers: [TiController],
  providers: [TiService, IaBearerGuard],
})
export class TiModule {}
