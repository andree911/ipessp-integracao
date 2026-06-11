import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailService } from './email.service';
import { EmailJobService } from './email-job.service';
import { EmailController } from './email.controller';
import { EmailLog } from './entities/email-log.entity';
import { SophiaModule } from '../sophia/sophia.module';

@Module({
  imports: [TypeOrmModule.forFeature([EmailLog]), SophiaModule],
  controllers: [EmailController],
  providers: [EmailService, EmailJobService],
  exports: [EmailService],
})
export class EmailModule {}
