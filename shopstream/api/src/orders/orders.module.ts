import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';
import { CartModule } from 'src/cart/cart.module';
import { CatalogModule } from 'src/catalog/catalog.module';
import { KAFKA_PRODUCER } from 'src/messaging/kafka.constants';
import { AuthModule } from './../auth/auth.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import {
  IdempotencyRecord,
  IdempotencyRecordSchema,
} from './schemas/idempotency-record.schema';
import { Order, OrderSchema } from './schemas/order.schema';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: IdempotencyRecord.name, schema: IdempotencyRecordSchema },
    ]),
    AuthModule,
    CartModule,
    CatalogModule,
    ClientsModule.registerAsync([
      {
        name: KAFKA_PRODUCER,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'shopstream-api',
              brokers: config
                .getOrThrow<string>('KAFKA_BROKERS')
                .split(',')
                .map((b) => b.trim())
                .filter(Boolean),
            },
            producerOnlyMode: true,
          },
        }),
      },
    ]),
  ],
  controllers: [OrdersController, WebhooksController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
