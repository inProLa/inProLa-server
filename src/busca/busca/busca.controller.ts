import { Controller, Get, Query } from '@nestjs/common';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';

@Controller('busca')
export class BuscaController {
  constructor(
    private dynamicServiceExecutor: DynamicServiceExecutor,
    private databaseService: DatabaseService,
  ) {}

  @Get()
  async getBusca(
    @Query('searchText') searchText: string,
  ): Promise<Array<string>> {
    return await this.dynamicServiceExecutor.executeAllBuscaFunctions({
      searchText: searchText,
      dataBaseClient: this.databaseService.client,
    });
  }
}
