import { Module } from '@nestjs/common';
import { ProcessController } from './process/process.controller';
import { ProcessService } from './process/process.service';
import { SharedModule } from '../shared/shared.module';
import { DynamicServiceExecutor } from '../plugin/pluginServiceExecutor';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [SharedModule, DiscoveryModule],
  controllers: [ProcessController],
  providers: [ProcessService, DynamicServiceExecutor],
})
export class ProcessModule {}
