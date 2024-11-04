import { PluginProcessPayload } from './plugin-process-payload';
import { PluginSearchPayload } from './plugin-search-payload';

export interface ProcessamentoServiceInterface {
  Processamento(payload: PluginProcessPayload): Promise<void>;
  Busca(payload: PluginSearchPayload): Promise<Array<string>>;
}
