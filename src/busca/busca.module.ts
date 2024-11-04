import { Module } from '@nestjs/common';
import { BuscaController } from './busca/busca.controller';
import { SharedModule } from '../shared/shared.module';
import { DynamicServiceExecutor } from '../plugin/pluginServiceExecutor';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [SharedModule, DiscoveryModule],
  providers: [DynamicServiceExecutor],
  controllers: [BuscaController],
})
export class BuscaModule {}
