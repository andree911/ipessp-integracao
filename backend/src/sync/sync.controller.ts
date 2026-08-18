import { Controller, Post, Get, HttpCode, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThrottlerGuard } from '@nestjs/throttler';
import { SyncService } from './sync.service';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';
import { AdminApiKeyGuard } from '../admin/guards/admin-api-key.guard';

@Controller('sync')
@UseGuards(ThrottlerGuard, AdminApiKeyGuard)
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    @InjectRepository(ResponsavelCache)
    private readonly cacheRepo: Repository<ResponsavelCache>,
  ) {}

  @Post('trigger')
  @HttpCode(202)
  trigger(): Promise<{ message: string }> {
    return this.syncService.triggerSync();
  }

  @Get('status')
  async status() {
    const total = await this.cacheRepo.count();
    return { responsaveisIndexados: total };
  }
}
