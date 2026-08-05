import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  // Inject connection mặc định của MongooseModule
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    // readyState === 1 nghĩa là đã connected (mongoose ConnectionStates)
    const mongoOk = this.connection.readyState === 1;
    return {
      ok: mongoOk,
      mongo: mongoOk ? 'up' : 'down',
      service: 'shopstream-api',
    };
  }
}
