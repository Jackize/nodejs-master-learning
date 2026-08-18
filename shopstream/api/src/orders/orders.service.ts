import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ProductsService } from '../catalog/products.service';
import { CartService } from './../cart/cart.service';
import { OrderResponse } from './dto/order-response.type';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import {
  Order,
  OrderDocument,
  OrderItem,
  OrderStatus,
} from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    private readonly cartService: CartService,
    private readonly productService: ProductsService,
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
  ) {}

  async checkout(userId: string): Promise<OrderResponse> {
    const session = await this.connection.startSession();
    try {
      let orderDoc!: OrderDocument;
      await session.withTransaction(async () => {
        const items = await this.cartService.getItemsOrEmpty(userId, session);
        if (!items || items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }
        for (const item of items) {
          await this.productService.holdStock(
            item.productId.toString(),
            item.quantity,
            session,
          );
        }
        const total = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0);
        const created = await this.orderModel.create(
          [
            {
              userId: new Types.ObjectId(userId),
              items,
              total,
              status: OrderStatus.PendingPayment,
            },
          ],
          { session },
        );
        orderDoc = created[0];
        await this.cartService.clearItems(userId, session);
      });
      return this.toResponse(orderDoc);
    } finally {
      await session.endSession();
    }
  }

  async handlePaymentWebhook(
    secret: string | undefined,
    dto: PaymentWebhookDto,
  ): Promise<OrderResponse> {
    const expected = this.config.getOrThrow<string>('PAYMENT_WEBHOOK_SECRET');
    if (!secret || secret !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }

    const session = await this.connection.startSession();
    try {
      let orderDoc!: OrderDocument;
      await session.withTransaction(async () => {
        const order = await this.orderModel
          .findById(dto.orderId)
          .session(session)
          .exec();
        if (!order) throw new NotFoundException('Order not found');

        if (dto.result === 'paid') {
          if (order.status === OrderStatus.Paid) {
            orderDoc = order;
            return;
          }
          if (order.status !== OrderStatus.PendingPayment)
            throw new ConflictException(
              `Cannot mark paid from status ${order.status}`,
            );
          order.status = OrderStatus.Paid;
          await order.save({ session });
          orderDoc = order;
          return;
        }

        // failed -> cancel + release
        if (order.status === OrderStatus.Cancelled) {
          orderDoc = order;
          return;
        }
        if (order.status !== OrderStatus.PendingPayment)
          throw new ConflictException(
            `Cannot mark cancelled from status ${order.status}`,
          );
        for (const item of order.items) {
          await this.productService.releaseStock(
            String(item.productId),
            item.quantity,
            session,
          );
        }
        order.status = OrderStatus.Cancelled;
        await order.save({ session });
        orderDoc = order;
      });
      return this.toResponse(orderDoc);
    } finally {
      await session.endSession();
    }
  }

  private toResponse(doc: OrderDocument): OrderResponse {
    return {
      id: doc._id.toString(),
      userId: doc.userId.toString(),
      items: doc.items.map((item: OrderItem) => ({
        productId: item.productId.toString(),
        quantity: item.quantity,
        name: item.name,
        unitPrice: item.unitPrice,
      })),
      total: doc.total,
      status: doc.status,
    };
  }
}
