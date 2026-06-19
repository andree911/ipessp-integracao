import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { IaBearerGuard } from '../ia/ia.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), HttpModule, SophiaModule],
  controllers: [LeadsController],
  providers: [LeadsService, IaBearerGuard],
  exports: [LeadsService],
})
export class LeadsModule {}
