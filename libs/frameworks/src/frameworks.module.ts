import { Module } from '@nestjs/common';
import { FrameworksService } from './frameworks.service';

@Module({
  providers: [FrameworksService],
  exports: [FrameworksService],
})
export class FrameworksModule {}
