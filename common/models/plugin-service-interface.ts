import { PluginProcessPayload } from './plugin-process-payload';
import { PluginSearchPayload } from './plugin-search-payload';

export interface PluginServiceInterface {
  process(payload: PluginProcessPayload): Promise<void>;
  search(payload: PluginSearchPayload): Promise<Array<any>>;
}
