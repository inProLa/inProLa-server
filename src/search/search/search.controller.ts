import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';

@Controller('search')
export class SearchController {
  constructor(
    private dynamicServiceExecutor: DynamicServiceExecutor,
    private databaseService: DatabaseService,
    private googleDriveService: GoogleDriveService,
  ) {}

  @Get()
  async getSearch(
    @Query('searchText') searchText: string,
  ): Promise<Array<string>> {
    return await this.dynamicServiceExecutor
      .executeAllSearchFunctions({
        searchText: searchText,
        dataBaseClient: this.databaseService.client,
      })
      .then((files) => {
        const uniqueFiles = new Set<string>();
        files.forEach((fileArray) => {
          fileArray.forEach((file) => {
            uniqueFiles.add(file);
          });
        });
        return Array.from(uniqueFiles);
      });
  }

  @Get('download')
  async downloadFiles(@Query('fileId') fileId: string, @Res() res: Response) {
    const buffer = await this.googleDriveService.downloadFile(fileId);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileId}.zip"`,
    });
    res.send(buffer);
  }
}
