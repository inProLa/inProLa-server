import { Test, TestingModule } from '@nestjs/testing';
import { ProcessamentoService } from './processamento.service';

describe('ProcessamentoService', () => {
  let service: ProcessamentoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProcessamentoService],
    }).compile();

    service = module.get<ProcessamentoService>(ProcessamentoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
