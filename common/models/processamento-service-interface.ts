import { PluginPayload } from './plugin-payload';

export interface ProcessamentoServiceInterface {
  Processamento(valor: PluginPayload): Promise<void>;
}
