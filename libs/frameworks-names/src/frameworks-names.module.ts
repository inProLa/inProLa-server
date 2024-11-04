import { Module } from '@nestjs/common';
import { FrameworksNamesService } from './frameworks-names.service';

@Module({
  providers: [FrameworksNamesService],
  exports: [FrameworksNamesService],
})
export class FrameworksNamesModule {}
