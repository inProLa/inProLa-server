import { Test, TestingModule } from '@nestjs/testing';
import { FrameworksNamesService } from './frameworks-names.service';

describe('FrameworksNamesService', () => {
  let service: FrameworksNamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FrameworksNamesService],
    }).compile();

    service = module.get<FrameworksNamesService>(FrameworksNamesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
