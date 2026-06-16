import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormulariosController } from './formularios.controller';
import { FormulariosService } from './formularios.service';
import { MensagemContato } from './entities/mensagem-contato.entity';
import { Manifestacao } from './entities/manifestacao.entity';
import { SolicitacaoEvento } from './entities/solicitacao-evento.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MensagemContato, Manifestacao, SolicitacaoEvento]),
    EmailModule,
  ],
  controllers: [FormulariosController],
  providers: [FormulariosService],
})
export class FormulariosModule {}
