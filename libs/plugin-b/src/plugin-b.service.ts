import { Injectable } from '@nestjs/common';
import { ProcessamentoServiceInterface } from '../../../common/processamentoServiceInterface';
import { ProcessamentoService } from '../../../common/processamentoService.decorator';

@Injectable()
@ProcessamentoService()
export class PluginBService implements ProcessamentoServiceInterface {
  async Processamento(valor: string): Promise<void> {
    console.log('plugin-b', valor);
  }
}
