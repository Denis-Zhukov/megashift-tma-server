import { Controller, All } from '@nestjs/common';

@Controller()
export class AppController {
  @All('health')
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
