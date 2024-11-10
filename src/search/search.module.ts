import { Module } from '@nestjs/common';
import { SearchController } from './search/search.controller';
import { SharedModule } from '../shared/shared.module';
import { DynamicServiceExecutor } from '../plugin/pluginServiceExecutor';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [SharedModule, DiscoveryModule],
  providers: [DynamicServiceExecutor],
  controllers: [SearchController],
})
export class SearchModule {}
