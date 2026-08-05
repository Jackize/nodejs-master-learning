import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  // Factory tạo module với mock connection.readyState
  async function createController(readyState: number) {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          // Token connection mặc định của @nestjs/mongoose
          provide: getConnectionToken(),
          useValue: { readyState },
        },
      ],
    }).compile();
    return module.get(HealthController);
  }

  it('trả ok=true khi mongo connected (readyState=1)', async () => {
    const controller = await createController(1);
    await expect(controller.check()).resolves.toEqual({
      ok: true,
      mongo: 'up',
      service: 'shopstream-api',
    });
  });

  it('trả ok=false khi mongo chưa connected', async () => {
    const controller = await createController(0);
    await expect(controller.check()).resolves.toEqual({
      ok: false,
      mongo: 'down',
      service: 'shopstream-api',
    });
  });
});
