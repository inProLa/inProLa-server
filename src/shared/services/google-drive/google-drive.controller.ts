import { Controller, Get, Res } from '@nestjs/common';
import { GoogleDriveService } from './google-drive.service';
import { Response } from 'express';

@Controller('google-drive')
export class GoogleDriveController {
  constructor(private readonly googleDriveService: GoogleDriveService) {}

  @Get('authorize')
  async authorize(@Res() response: Response) {
    try {
      await this.googleDriveService.authorize();
      return response.status(200).json({ message: 'Authorization successful' });
    } catch (error) {
      return response.status(500).json({
        message: 'Authorization failed',
        error: error.message,
      });
    }
  }
}
