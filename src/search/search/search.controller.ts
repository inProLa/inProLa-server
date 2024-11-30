import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('search')
export class SearchController {
  constructor(
    private dynamicServiceExecutor: DynamicServiceExecutor,
    private databaseService: DatabaseService,
    private googleDriveService: GoogleDriveService,
  ) {}

  @Get()
  async getSearch(
    @Query('searchText') searchText: string = '',
    @Query('filters') filters: string[] = [],
  ): Promise<Array<string>> {
    filters = typeof filters === 'string' ? [filters] : filters;

    return await this.dynamicServiceExecutor
      .executeAllSearchFunctions({
        searchText,
        filters: filters,
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

  @Get('download/zip')
  async downloadZipFile(@Query('fileId') fileId: string, @Res() res: Response) {
    const buffer = await this.googleDriveService.downloadFile(fileId);
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${fileId}.zip"`,
    });
    res.send(buffer);
  }

  @Get('download/pdf')
  async downloadPdfFile(@Query('fileId') fileId: string, @Res() res: Response) {
    const filePath = path.join(process.cwd(), 'latexProjects', `${fileId}.pdf`);

    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileId}.pdf"`,
      });
      res.send(buffer);
    } else {
      res.status(404).send('Não foi possível encontrar o arquivo PDF');
    }
  }

  @Get('filters')
  async getFiltersNames(): Promise<string[]> {
    return this.dynamicServiceExecutor.getFiltersNames();
  }
}
