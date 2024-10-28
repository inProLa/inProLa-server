import { Module } from '@nestjs/common';
import { ProcessamentoController } from './processamento/processamento.controller';
import { ProcessamentoService } from './processamento/processamento.service';
import { SharedModule } from '../shared/shared.module';
import { DynamicServiceExecutor } from '../plugin/pluginServiceExecutor';
import { DiscoveryModule } from '@nestjs/core';

@Module({
  imports: [SharedModule, DiscoveryModule],
  controllers: [ProcessamentoController],
  providers: [ProcessamentoService, DynamicServiceExecutor],
})
export class ProcessamentoModule {}
