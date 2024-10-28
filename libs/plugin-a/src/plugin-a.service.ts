import { Injectable } from '@nestjs/common';
import { ProcessamentoServiceInterface } from '../../../common/processamentoServiceInterface';
import { ProcessamentoService } from '../../../common/processamentoService.decorator';

@Injectable()
@ProcessamentoService()
export class PluginAService implements ProcessamentoServiceInterface {
  async Processamento(valor: string): Promise<void> {
    console.log('plugin-a', valor);
  }
}
