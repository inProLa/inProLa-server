import { Test, TestingModule } from '@nestjs/testing';
import { PluginControllerBController } from './plugin-controller-b.controller';

describe('PluginControllerBController', () => {
  let controller: PluginControllerBController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PluginControllerBController],
    }).compile();

    controller = module.get<PluginControllerBController>(PluginControllerBController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
