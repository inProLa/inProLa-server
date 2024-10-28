import { SetMetadata } from '@nestjs/common';

export const ProcessamentoService = () =>
  SetMetadata('isProcessamentoService', true);
