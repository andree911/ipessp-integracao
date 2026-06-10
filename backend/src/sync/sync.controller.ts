import { Controller, Post, Get, HttpCode } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncService } from './sync.service';
import { SyncLog } from './entities/sync-log.entity';

@Controller('sync')
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    @InjectRepository(SyncLog)
    private readonly syncLogRepo: Repository<SyncLog>,
  ) {}

  @Post('trigger')
  @HttpCode(202)
  trigger(): Promise<{ message: string }> {
    return this.syncService.triggerSync();
  }

  @Get('status')
  async status() {
    const [total, confirmed, sent, error] = await Promise.all([
      this.syncLogRepo.count(),
      this.syncLogRepo.count({ where: { status: 'confirmed' } }),
      this.syncLogRepo.count({ where: { status: 'sent' } }),
      this.syncLogRepo.count({ where: { status: 'error' } }),
    ]);

    return { total, confirmed, sent, error, pending: total - confirmed - sent - error };
  }
}
