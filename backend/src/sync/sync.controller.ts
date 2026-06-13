import { Controller, Post, Get, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncService } from './sync.service';
import { ResponsavelCache } from '../ia/entities/responsavel-cache.entity';

@Controller('sync')
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
