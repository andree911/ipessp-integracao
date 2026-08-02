import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidaturasController } from './candidaturas.controller';
import { CandidaturasService } from './candidaturas.service';
import { Candidatura } from './entities/candidatura.entity';
import { EmailModule } from '../email/email.module';
import { StorageService } from '../common/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([Candidatura]), EmailModule],
  controllers: [CandidaturasController],
  providers: [CandidaturasService, StorageService],
})
export class CandidaturasModule {}
