import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailJobService } from './email-job.service';
import { LeadEmailService } from './lead-email.service';
import { EmailController } from './email.controller';
import { EmailLog } from './entities/email-log.entity';
import { Lead } from '../leads/entities/lead.entity';
import { SophiaModule } from '../sophia/sophia.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog, Lead]), SophiaModule],
  controllers: [EmailController],
  providers: [EmailService, EmailJobService, LeadEmailService],
  exports: [EmailService, LeadEmailService],
})
export class EmailModule {}
