import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProcessamentoServiceInterface } from '../../common/models/processamento-service-interface';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PluginProcessPayload } from '../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../common/models/plugin-search-payload';

@Injectable()
export class DynamicServiceExecutor implements OnModuleInit {
  private services: ProcessamentoServiceInterface[] = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
  ) {}

  onModuleInit() {
    const providers = this.discoveryService.getProviders();
    providers.forEach((provider) => {
      const instance = provider.instance;
      if (
        instance &&
        this.reflector.get('isProcessamentoService', instance.constructor)
      ) {
        this.services.push(instance);
      }
    });
  }

  async executeAllProcessamentoFunctions(payload: PluginProcessPayload) {
    for (const service of this.services) {
      await service.Processamento(payload);
    }
  }

  async executeAllBuscaFunctions(
    payload: PluginSearchPayload,
  ): Promise<Array<string>> {
    const filesIds = [];

    for (const service of this.services) {
      const respose = await service.Busca(payload);
      filesIds.push(respose);
    }

    return filesIds;
  }
}
