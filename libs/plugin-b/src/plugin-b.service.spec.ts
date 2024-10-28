import { Test, TestingModule } from '@nestjs/testing';
import { PluginBService } from './plugin-b.service';

describe('PluginBService', () => {
  let service: PluginBService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PluginBService],
    }).compile();

    service = module.get<PluginBService>(PluginBService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
