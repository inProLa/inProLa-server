import { Module } from '@nestjs/common';
import { TitleService } from './title.service';

@Module({
  providers: [TitleService],
  exports: [TitleService],
})
export class TitleModule {}
