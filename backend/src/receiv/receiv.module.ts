import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { RecivAuthService } from './receiv-auth.service';
import { RecivService } from './receiv.service';

@Module({
  imports: [HttpModule],
  providers: [RecivAuthService, RecivService],
  exports: [RecivService],
})
export class RecivModule {}
