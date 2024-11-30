import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { GoogleDriveService } from '../../shared/services/google-drive/google-drive.service';
import { DynamicServiceExecutor } from '../../plugin/pluginServiceExecutor';
import { DatabaseService } from '../../shared/services/database/database.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as unzipper from 'unzipper';

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

      return { message: 'Processamento concluído', data: [] };
    } catch (error) {
      console.error(error);
      throw new Error('Error uploading file');
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAndProcess(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
  ) {
    try {
      const directory = await unzipper.Open.buffer(file.buffer);
      const hasSbcTemplate = directory.files.some(
        (file) => file.path === 'sbc-template.sty',
      );

      if (!hasSbcTemplate) {
        throw new Error('The zip file does not contain sbc-template.sty');
        return;
      }

      const uploadedFile = await this.googleService.uploadAndProcess(
        file,
        title,
      );
      await this.dynamicServiceExecutor.executeAllProcessFunctions({
        texFile: uploadedFile,
        dataBaseClient: this.databaseService.client,
      });

      return { message: 'Processamento concluído', data: [] };
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
