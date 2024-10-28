import { DynamicModule, Logger, Module } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PluginController } from './plugin/plugin.controller';
import { DynamicServiceExecutor } from './pluginServiceExecutor';
import { DiscoveryModule } from '@nestjs/core';

export const PLUGIN_PATH = path.normalize(
  path.join(process.cwd(), 'dist/libs'),
);

@Module({
  imports: [DiscoveryModule],
  controllers: [PluginController],
  providers: [DynamicServiceExecutor],
})
export class PluginModule {
  public static pluginsArray: Plugin[] = [];

  public static async registerPluginsAsync(): Promise<DynamicModule> {
    return this.loadPlugins();
  }

  private static loadPlugins(): Promise<DynamicModule> {
    Logger.log(`Loading plugins from ${PLUGIN_PATH}`, 'LoadPlugins');

    const loadedPlugins: Array<Promise<DynamicModule>> = [];
    this.searchPluginsInFolder(PLUGIN_PATH).forEach((filePath) => {
      loadedPlugins.push(
        this.loadPlugin(filePath).then((module) => module as DynamicModule),
      );
    });

    return Promise.all(loadedPlugins).then((allPlugins: DynamicModule[]) => {
      // console.log('All modules resolved: ', allPlugins.length, 'plugins');

      if (allPlugins.length > 0) {
        allPlugins.forEach((module: DynamicModule) => {
          const foundModuleEntryName = Object.keys(module).find((key) =>
            key.indexOf('Module'),
          );
          if (foundModuleEntryName) {
            this.pluginsArray.push({
              name: foundModuleEntryName,
              module: module[foundModuleEntryName],
            });
            Logger.log(
              `Plugin '${foundModuleEntryName}' loaded`,
              'LoadPlugins',
            );
          }
        });
      }
      return {
        module: PluginModule,
        imports: [...this.pluginsArray.map((plugin) => plugin.module)],
      } as DynamicModule;
    });
  }

  private static loadPlugin(pluginPath: string): Promise<DynamicModule> {
    return import(pluginPath);
  }

  private static searchPluginsInFolder(folder: string): string[] {
    return this.recFindByExt(folder, 'module.js');
  }

  private static recFindByExt(
    base: string,
    ext: string,
    files?: string[],
    result?: string[],
  ): any[] {
    files = files || fs.readdirSync(base);
    result = result || [];

    files.forEach((file) => {
      const newbase = path.join(base, file);
      if (fs.statSync(newbase).isDirectory()) {
        result = this.recFindByExt(
          newbase,
          ext,
          fs.readdirSync(newbase),
          result,
        );
      } else {
        if (file.substr(-1 * (ext.length + 1)) === '.' + ext) {
          if (result) {
            result.push(newbase);
          }
        }
      }
    });
    return result;
  }
}

export interface PluginConfig {
  name: string;
  version: string;
  description: string;
  file: string;
  entryClass: string;
}

interface Plugin {
  name: string;
  module: DynamicModule;
}
