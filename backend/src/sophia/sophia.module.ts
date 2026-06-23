import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SophiaService } from './sophia.service';

@Module({
  imports: [HttpModule.register({ timeout: 15000 })],
  providers: [SophiaService],
  exports: [SophiaService],
})
export class SophiaModule {}
