import { Controller, Get } from '@nestjs/common';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';

@Controller('processamento')
export class ProcessamentoController {
  constructor(
    private googleService: GoogleDriveService,
    private dynamicServiceExecutor: DynamicServiceExecutor,
    private databaseService: DatabaseService,
  ) {}

  @Get()
  async downloadAndProcess() {
    try {
      await this.googleService.listFiles().then((files) =>
        files.forEach(async (file) => {
          await this.dynamicServiceExecutor.executeAllProcessamentoFunctions({
            texFile: file,
            dataBaseClient: this.databaseService.client,
          });
        }),
      );

      return 'Processamento concluído';
    } catch (error) {
      console.error(error);
      return 'Erro ao processar arquivos';
    }
  }
}
