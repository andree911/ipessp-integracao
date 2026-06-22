import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClienteCache } from './entities/cliente-cache.entity';
import { LancamentoCache } from './entities/lancamento-cache.entity';
import { FinanceiroService } from './financeiro.service';
import { ImportacaoService } from './importacao.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClienteCache, LancamentoCache])],
  providers: [FinanceiroService, ImportacaoService],
  exports: [FinanceiroService, ImportacaoService],
})
export class FinanceiroModule {}
