import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './mercadopago.service';
import { MercadoPagoController } from './mercadopago.controller';
import { EmailModule } from '../email/email.module';
import { SophiaModule } from '../sophia/sophia.module';
import { MatriculaCache } from '../matriculas/entities/matricula-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatriculaCache]), EmailModule, SophiaModule],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
