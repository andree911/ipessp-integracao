import { Body, Controller, Post } from '@nestjs/common';
import { FormulariosService } from './formularios.service';
import { MensagemContatoDto } from './dto/mensagem-contato.dto';
import { ManifestacaoDto } from './dto/manifestacao.dto';
import { SolicitacaoEventoDto } from './dto/solicitacao-evento.dto';

@Controller('v1')
export class FormulariosController {
  constructor(private readonly formulariosService: FormulariosService) {}

  @Post('mensagens-contato')
  criarContato(@Body() dto: MensagemContatoDto) {
    return this.formulariosService.criarContato(dto);
  }

  @Post('manifestacoes')
  criarManifestacao(@Body() dto: ManifestacaoDto) {
    return this.formulariosService.criarManifestacao(dto);
  }

  @Post('solicitacoes-eventos')
  criarSolicitacaoEvento(@Body() dto: SolicitacaoEventoDto) {
    return this.formulariosService.criarSolicitacaoEvento(dto);
  }
}
