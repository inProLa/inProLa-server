import { Test, TestingModule } from '@nestjs/testing';
import { ProcessamentoController } from './processamento.controller';

describe('ProcessamentoController', () => {
  let controller: ProcessamentoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessamentoController],
    }).compile();

    controller = module.get<ProcessamentoController>(ProcessamentoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
