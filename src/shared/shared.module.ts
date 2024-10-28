import { Module } from '@nestjs/common';
import { DatabaseService } from './services/database/database.service';
import { GoogleDriveService } from './services/google-drive/google-drive.service';

@Module({
  providers: [DatabaseService, GoogleDriveService],
  exports: [DatabaseService, GoogleDriveService],
})
export class SharedModule {}
