import { SetMetadata } from '@nestjs/common';

export const PluginService = () => SetMetadata('isPluginService', true);
