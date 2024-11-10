import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { PluginProcessPayload } from '../../common/models/plugin-process-payload';
import { PluginSearchPayload } from '../../common/models/plugin-search-payload';
import { PluginServiceInterface } from '../../common/models/plugin-service-interface';

@Injectable()
export class DynamicServiceExecutor implements OnModuleInit {
  private services: PluginServiceInterface[] = [];

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
        this.reflector.get('isPluginService', instance.constructor)
      ) {
        this.services.push(instance);
      }
    });
  }

  async executeAllProcessFunctions(payload: PluginProcessPayload) {
    for (const service of this.services) {
      await service.process(payload);
    }
  }

  async executeAllSearchFunctions(
    payload: PluginSearchPayload,
  ): Promise<Array<Array<any>>> {
    const files = [];

    for (const service of this.services) {
      const respose = await service.search(payload);
      files.push(respose);
    }

    return files;
  }
}
