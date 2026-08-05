import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Tạo HTTP app Nest từ root module
  const app = await NestFactory.create(AppModule);
  // PORT từ .env (ConfigModule load trước khi listen)
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // Log rõ để tự kiểm khi chạy local
  console.log(`ShopStream API đang lắng nghe http://localhost:${port}`);
}
bootstrap();
