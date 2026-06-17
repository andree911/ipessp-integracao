import { Module } from '@nestjs/common';
import { MeService } from './me.service';
import { MeController } from './me.controller';
import { AuthModule } from '../auth/auth.module';
import { SophiaModule } from '../sophia/sophia.module';

@Module({
  imports: [AuthModule, SophiaModule],
  providers: [MeService],
  controllers: [MeController],
})
export class MeModule {}
