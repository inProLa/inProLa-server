import { Module } from '@nestjs/common';
import { PluginBService } from './plugin-b.service';
import { PluginControllerBController } from './plugin-controller-b/plugin-controller-b.controller';

@Module({
  providers: [PluginBService],
  exports: [PluginBService],
  controllers: [PluginControllerBController],
})
export class PluginBModule {}
