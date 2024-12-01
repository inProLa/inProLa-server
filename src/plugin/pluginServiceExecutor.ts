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
  ): Promise<Array<any>> {
    let files = [];

    for (const service of this.services) {
      if (
        payload?.filters?.length == 0 ||
        payload?.filters?.includes(service.filterName)
      ) {
        const response = await service.search(payload);
        files = [...files, ...response];
      }
    }

    return files;
  }

  async getFiltersNames(): Promise<string[]> {
    return this.services.map((service) => service.filterName);
  }
}
