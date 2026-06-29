import { Module } from '@nestjs/common';
import { SophiaModule } from '../sophia/sophia.module';
import { EmailModule } from '../email/email.module';
import { MercadoPagoModule } from '../mercadopago/mercadopago.module';
import { IaBearerGuard } from '../ia/ia.guard';
import { MatriculasController } from './matriculas.controller';
import { MatriculasService } from './matriculas.service';

@Module({
  imports: [SophiaModule, EmailModule, MercadoPagoModule],
  controllers: [MatriculasController],
  providers: [MatriculasService, IaBearerGuard],
})
export class MatriculasModule {}
