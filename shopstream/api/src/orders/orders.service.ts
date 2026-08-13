import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { ProductsService } from '../catalog/products.service';
import { CartService } from './../cart/cart.service';
import { OrderResponse } from './dto/order-response.type';
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
