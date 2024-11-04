import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProcessamentoServiceInterface } from '../../common/models/processamento-service-interface';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PluginPayload } from '../../common/models/plugin-payload';

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

  async executeAll(payload: PluginPayload) {
    for (const service of this.services) {
      await service.Processamento(payload);
    }
  }
}
