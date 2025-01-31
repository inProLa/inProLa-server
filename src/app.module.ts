import { Module } from '@nestjs/common';
import { ProcessModule } from './process/processModule';
import { SearchModule } from './search/search.module';
import { PluginModule } from './plugin/plugin.module';
import { GoogleDriveModule } from './shared/services/google-drive/google-drive.module';

@Module({
  imports: [
    ProcessModule,
    SearchModule,
    PluginModule.registerPluginsAsync(),
    GoogleDriveModule,
  ],
})
export class AppModule {}
