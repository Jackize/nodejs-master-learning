import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  const config = app.get(ConfigService);
  const brokers = config
    .getOrThrow<string>('KAFKA_BROKERS')
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
  const groupId = config.getOrThrow<string>('KAFKA_GROUP_ID');

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'shopstream-api',
        brokers,
      },
      consumer: { groupId },
    },
  });
  await app.startAllMicroservices();
  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
  console.log(
    `ShopStream API đang lắng nghe http://localhost:${port} + Kafka group=${groupId} (-server)`,
  );
}
bootstrap();
