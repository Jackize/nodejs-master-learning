import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { lastValueFrom } from 'rxjs';
import { ProductsService } from '../catalog/products.service';
import { KAFKA_PRODUCER, ORDER_PAID_TOPIC } from '../messaging/kafka.constants';
import { CartService } from './../cart/cart.service';
import { OrderResponse } from './dto/order-response.type';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import {
  IdempotencyRecord,
  IdempotencyRecordDocument,
  IdempotencyStatus,
} from './schemas/idempotency-record.schema';
import {
  Order,
  OrderDocument,
  OrderItem,
  OrderStatus,
} from './schemas/order.schema';
import { verifyPaymentSignature } from './utils/payment-signature';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
    @InjectModel(IdempotencyRecord.name)
    private readonly idempotencyRecordModel: Model<IdempotencyRecordDocument>,
    private readonly cartService: CartService,
    private readonly productService: ProductsService,
    @InjectConnection() private readonly connection: Connection,
    private readonly config: ConfigService,
    @Inject(KAFKA_PRODUCER) private readonly kafka: ClientKafka,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.kafka.connect();
  }

  async createOrderFromCart(userId: string): Promise<OrderResponse> {
    const session = await this.connection.startSession();
    try {
      let orderDoc!: OrderDocument;
      // start transaction
      await session.withTransaction(async () => {
        const items = await this.cartService.getItemsOrEmpty(userId, session);
        if (!items || items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }
        // hold stock
        for (const item of items) {
          await this.productService.holdStock(
            item.productId.toString(),
            item.quantity,
            session,
          );
        }
        // create order
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

  /**
   * Câu hỏi phỏng vấn: Vì sao phải tạo idempotency record để tránh duplicate request?
   *
   * Trường hợp:
   * 1. Khi client bấm gửi request 2 lần, bởi vì client không biết response từ server có thể tốn vài giây để xử lý, nên client gửi request 2 lần
   * 2. Request bị timeout nhưng gateway payment đã charge tiền cho người dùng => nguyên nhân do response đã bị mất trên network
   * 3. Retry ở nhiều tầng khác nhau của hệ thống như là mobile, api gateway, service retry, ...
   * @param userId
   * @param idempotencyKey
   * @returns OrderResponse
   */
  async checkout(
    userId: string,
    idempotencyKey: string | undefined,
  ): Promise<OrderResponse> {
    if (!idempotencyKey)
      throw new BadRequestException('Idempotency-Key header is required');
    const key = idempotencyKey.trim();
    const uid = new Types.ObjectId(userId);

    try {
      // Tạo idempotency record để tránh duplicate request
      await this.idempotencyRecordModel.create({
        userId: uid,
        key,
        status: IdempotencyStatus.Started,
        orderId: null,
      });
    } catch (error: unknown) {
      // Lỗi key đã tồn tại trong db
      if ((error as { code?: number }).code !== 11000) throw error; //unique constraint violation
      // Xử lý lỗi sau khi bị duplicate key
      // Tìm lại chính xác idempotency record và orderId đã tồn tại
      const existing = await this.idempotencyRecordModel
        .findOne({ userId: uid, key })
        .exec();
      if (
        existing?.status === IdempotencyStatus.Completed &&
        existing.orderId
      ) {
        const order = await this.orderModel.findById(existing.orderId).exec();
        if (!order) throw new NotFoundException('Order not found');
        return this.toResponse(order); //replay - don't hold stock again
      }
      // Lỗi key đang trong quá trình xử lý
      throw new ConflictException('Idempotency key in progress');
    }

    try {
      const order = await this.createOrderFromCart(userId);
      // update status và orderId của idempotency record
      await this.idempotencyRecordModel
        .updateOne(
          { userId: uid, key },
          {
            $set: {
              status: IdempotencyStatus.Completed,
              orderId: new Types.ObjectId(order.id),
            },
          },
        )
        .exec();
      return order;
    } catch (error) {
      // delete idempotency record để cho phép retry khi duplicate key được gửi
      await this.idempotencyRecordModel.deleteOne({ userId: uid, key }).exec();
      throw error;
    }
  }

  /**
   * Webhook handler cho payment gateway
   * Câu hỏi phỏng vấn: Vì sao phải verify signature của request từ payment gateway?
   *
   * @param rawBody - body của request từ payment gateway
   * @param signatureHeader - header của request từ payment gateway
   * @param dto - dto của request từ payment gateway
   * @returns OrderResponse
   */
  async handlePaymentWebhook(
    rawBody: Buffer | undefined,
    signatureHeader: string | undefined,
    dto: PaymentWebhookDto,
  ): Promise<OrderResponse> {
    const secret = this.config.getOrThrow<string>('PAYMENT_WEBHOOK_SECRET');
    try {
      verifyPaymentSignature({ rawBody, signatureHeader, secret });
    } catch {
      // Nuốt chi tiết lỗi nội bộ — client chỉ thấy 401
      throw new UnauthorizedException('Invalid webhook signature');
    }
    const session = await this.connection.startSession();
    try {
      let orderDoc!: OrderDocument;
      // flag to check if the order has become paid
      let becomePaid = false;
      // start transaction
      await session.withTransaction(async () => {
        // find order by orderId
        const order = await this.orderModel
          .findById(dto.orderId)
          .session(session)
          .exec();
        if (!order) throw new NotFoundException('Order not found');

        // if the webhook result is paid
        if (dto.result === 'paid') {
          // if the order is already paid -> don't do anything
          if (order.status === OrderStatus.Paid) {
            orderDoc = order;
            return;
          }
          // if the order is not in pending payment status -> throw error
          if (order.status !== OrderStatus.PendingPayment)
            throw new ConflictException(
              `Cannot mark paid from status ${order.status}`,
            );
          // update status to paid
          order.status = OrderStatus.Paid;
          await order.save({ session });
          orderDoc = order;
          // set flag to true
          becomePaid = true;
          return;
        }

        // if the webhook result is failed
        // if the order is cancelled -> don't do anything
        if (order.status === OrderStatus.Cancelled) {
          orderDoc = order;
          return;
        }
        // if the order is not in pending payment status -> throw error
        if (order.status !== OrderStatus.PendingPayment)
          throw new ConflictException(
            `Cannot mark cancelled from status ${order.status}`,
          );
        // release stock
        for (const item of order.items) {
          await this.productService.releaseStock(
            String(item.productId),
            item.quantity,
            session,
          );
        }
        // update status to cancelled
        order.status = OrderStatus.Cancelled;
        await order.save({ session });
        orderDoc = order;
      });
      // publish order paid message to kafka if the order has become paid
      if (becomePaid) {
        await this.publishOrderPaid(orderDoc);
      }
      return this.toResponse(orderDoc);
    } finally {
      await session.endSession();
    }
  }

  /**
   * Publish order paid message to kafka
   * @param order - order document
   * @returns void
   */
  private async publishOrderPaid(order: OrderDocument): Promise<void> {
    const orderId = order._id.toString();
    await lastValueFrom(
      this.kafka.emit(ORDER_PAID_TOPIC, {
        key: orderId, // cùng order → cùng partition
        value: {
          orderId,
          userId: order.userId.toString(),
          total: order.total,
          status: OrderStatus.Paid,
          paidAt: new Date().toISOString(),
        },
      }),
    );
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
