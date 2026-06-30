import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SophiaModule } from '../sophia/sophia.module';
import { EmailModule } from '../email/email.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { IaBearerGuard } from '../ia/ia.guard';
import { MatriculasController } from './matriculas.controller';
import { MatriculasService } from './matriculas.service';
import { MatriculaCache } from './entities/matricula-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatriculaCache]), SophiaModule, EmailModule, MercadoPagoModule],
  controllers: [MatriculasController],
  providers: [MatriculasService, IaBearerGuard],
})
export class MatriculasModule {}
