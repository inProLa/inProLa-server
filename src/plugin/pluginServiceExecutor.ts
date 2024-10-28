import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProcessamentoServiceInterface } from '../../common/processamentoServiceInterface';
import { DiscoveryService, Reflector } from '@nestjs/core';

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

  async executeAll(valor: string) {
    for (const service of this.services) {
      await service.Processamento(valor);
    }
  }
}
