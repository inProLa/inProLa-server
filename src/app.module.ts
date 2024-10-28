import { Module } from '@nestjs/common';
import { ProcessamentoModule } from './processamento/processamento.module';
import { BuscaModule } from './busca/busca.module';
import { PluginModule } from './plugin/plugin.module';

@Module({
  imports: [
    ProcessamentoModule,
    BuscaModule,
    PluginModule.registerPluginsAsync(),
  ],
})
export class AppModule {}
