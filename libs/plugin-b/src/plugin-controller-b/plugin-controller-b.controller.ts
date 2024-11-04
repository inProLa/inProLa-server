import { Controller, Get } from '@nestjs/common';

@Controller('plugin-controller-b')
export class PluginControllerBController {
  @Get()
  test() {
    console.log('plugin-controller-b');
    return 'works2';
  }
}
