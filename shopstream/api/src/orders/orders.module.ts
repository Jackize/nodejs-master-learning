import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CartModule } from 'src/cart/cart.module';
import { CatalogModule } from 'src/catalog/catalog.module';
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
  ],
  controllers: [OrdersController, WebhooksController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
