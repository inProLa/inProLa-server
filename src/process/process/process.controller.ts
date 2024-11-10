import { Controller, Post } from '@nestjs/common';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';

@Controller('process')
export class ProcessController {
  constructor(
    private googleService: GoogleDriveService,
    private readonly dynamicServiceExecutor: DynamicServiceExecutor,
    private databaseService: DatabaseService,
  ) {}

  @Post()
  async downloadAndProcess() {
    try {
      await this.googleService.listFiles().then((files) =>
        files.forEach(async (file) => {
          await this.dynamicServiceExecutor.executeAllProcessFunctions({
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
