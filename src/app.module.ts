import { Module } from '@nestjs/common';
import { ProcessModule } from './process/processModule';
import { SearchModule } from './search/search.module';
import { PluginModule } from './plugin/plugin.module';
import { GoogleDriveModule } from './shared/services/google-drive/google-drive.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ProcessModule,
    SearchModule,
    PluginModule.registerPluginsAsync(),
    GoogleDriveModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..',	'frontend', 'dist', 'in-pro-la-front', 'browser'),
      exclude: ['/api*'],
    }),
  ],
})
export class AppModule {}
