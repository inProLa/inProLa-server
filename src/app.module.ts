import { Module } from '@nestjs/common';
import { Process } from './process/process';
import { SearchModule } from './search/search.module';
import { PluginModule } from './plugin/plugin.module';

@Module({
  imports: [Process, SearchModule, PluginModule.registerPluginsAsync()],
})
export class AppModule {}
