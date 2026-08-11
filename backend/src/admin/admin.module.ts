import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminApiKeyGuard } from './guards/admin-api-key.guard';
import { FinanceiroModule } from '../financeiro/financeiro.module';
import { EmailModule } from '../email/email.module';
import { SophiaModule } from '../sophia/sophia.module';

@Module({
  imports: [FinanceiroModule, EmailModule, SophiaModule],
  controllers: [AdminController],
  providers: [AdminApiKeyGuard],
})
export class AdminModule {}
