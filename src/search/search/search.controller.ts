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
  ): Promise<Array<object>> {
    filters = typeof filters === 'string' ? [filters] : filters;

    const files = await this.dynamicServiceExecutor.executeAllSearchFunctions({
      searchText,
      filters: filters,
      dataBaseClient: this.databaseService.client,
    });

    const uniqueFiles = new Map<string, object>();
    files.forEach((file) => {
      const uniqueKey = file['fileId']; // Assuming 'fileId' is the unique property
      if (!uniqueFiles.has(uniqueKey)) {
        uniqueFiles.set(uniqueKey, file);
      }
    });

    return Array.from(uniqueFiles.values());
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
