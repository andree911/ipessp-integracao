import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { LeadHistorico } from './entities/lead-historico.entity';
import { SophiaModule } from '../sophia/sophia.module';
import { IaBearerGuard } from '../ia/ia.guard';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Lead, LeadHistorico]),
    HttpModule,
    SophiaModule,
    forwardRef(() => EmailModule),
  ],
  controllers: [LeadsController],
  providers: [LeadsService, IaBearerGuard],
  exports: [LeadsService, TypeOrmModule],
})
export class LeadsModule {}
