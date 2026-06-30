import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MercadoPagoService } from './mercadopago.service';
import { MercadoPagoController } from './mercadopago.controller';
import { EmailModule } from '../email/email.module';
import { MatriculaCache } from '../matriculas/entities/matricula-cache.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MatriculaCache]), EmailModule],
  controllers: [MercadoPagoController],
  providers: [MercadoPagoService],
  exports: [MercadoPagoService],
})
export class MercadoPagoModule {}
