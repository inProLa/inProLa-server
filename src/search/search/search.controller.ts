import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';
import * as AdmZip from 'adm-zip';

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
    try {
      // Download the ZIP file from Google Drive
      const zipBuffer = await this.googleDriveService.downloadFile(fileId);

      // Create a new instance of AdmZip with the downloaded buffer
      const zip = new AdmZip(zipBuffer);

      // Find the PDF file in the ZIP
      const pdfEntry = zip
        .getEntries()
        .find((entry) => entry.entryName.endsWith('.pdf'));

      if (!pdfEntry) {
        return res.status(404).send('Arquivo PDF não encontrado dentro do ZIP');
      }

      // Extract the PDF content
      const pdfBuffer = pdfEntry.getData();

      // Sanitize the filename
      const originalName = pdfEntry.entryName;
      const sanitizedName = originalName
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Replace special chars with underscore
        .replace(/__+/g, '_'); // Replace multiple underscores with single one

      console.log('Original filename:', originalName);
      console.log('Sanitized filename:', sanitizedName);

      // Send the PDF file
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${sanitizedName}"`,
      });
      res.send(pdfBuffer);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      res.status(500).send('Erro ao processar o arquivo');
    }
  }

  @Get('filters')
  async getFiltersNames(): Promise<string[]> {
    return this.dynamicServiceExecutor.getFiltersNames();
  }

  @Get('health-check')
  async checkConnections(): Promise<{
    database: boolean;
    googleDrive: boolean;
  }> {
    const result = {
      database: false,
      googleDrive: false,
    };

    try {
      // Test database connection
      await this.databaseService.client.db().admin().ping();
      result.database = true;
    } catch (error) {
      console.error('Database connection error:', error);
    }

    try {
      // Test Google Drive connection by attempting to list files
      await this.googleDriveService.listFiles();
      result.googleDrive = true;
    } catch (error) {
      console.error('Google Drive connection error:', error);
    }

    return result;
  }
}
