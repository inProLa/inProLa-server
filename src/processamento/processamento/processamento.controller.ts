import { Controller, Get } from '@nestjs/common';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';
import { ProcessamentoService } from './processamento.service';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';

@Controller('processamento')
export class ProcessamentoController {
  constructor(
    private googleService: GoogleDriveService,
    private processamentoService: ProcessamentoService,
    private dynamicServiceExecutor: DynamicServiceExecutor,
  ) {}

  @Get('dynamic')
  async dynamic() {
    console.log('dynamic');
    await this.dynamicServiceExecutor.executeAll('Teste de valor');
  }

  @Get()
  async downloadAndProcess() {
    try {
      await this.googleService.listFiles();
      await this.processamentoService.processTexFilesInLatexFolders();
    } catch (error) {
      console.error(error);
    }
  }
}
