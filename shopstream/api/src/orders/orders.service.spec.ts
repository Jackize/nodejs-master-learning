import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import mongoose, { Connection, Model } from 'mongoose';
import { CartService } from '../cart/cart.service';
import { ProductsService } from '../catalog/products.service';
import { OrdersService } from './orders.service';
import {
  IdempotencyRecordDocument,
  IdempotencyStatus,
} from './schemas/idempotency-record.schema';
import { OrderDocument, OrderStatus } from './schemas/order.schema';

describe('OrdersService', () => {
  let service: OrdersService;

  const WEBHOOK_SECRET = 'payment-webhook-secret-16+';
  const IDEMPOTENCY_KEY = 'checkout-key-1';

  const cartService = {
    getItemsOrEmpty: jest.fn(),
    clearItems: jest.fn(),
  };
  const productService = {
    holdStock: jest.fn(),
    releaseStock: jest.fn(),
  };
  const orderModel = {
    create: jest.fn(),
    findById: jest.fn(),
  };
  const idemModel = {
    create: jest.fn(),
    findOne: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  };
  const session = {
    withTransaction: jest.fn(async (fn: () => Promise<unknown>) => fn()),
    endSession: jest.fn().mockResolvedValue(undefined),
  };
  const connection = {
    startSession: jest.fn().mockResolvedValue(session),
  };
  const config = {
    getOrThrow: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connection.startSession.mockResolvedValue(session);
    session.withTransaction.mockImplementation(
      async (fn: () => Promise<unknown>) => fn(),
    );
    session.endSession.mockResolvedValue(undefined);
    config.getOrThrow.mockImplementation((key: string) => {
      if (key === 'PAYMENT_WEBHOOK_SECRET') return WEBHOOK_SECRET;
      throw new Error(`Unexpected config key: ${key}`);
    });
    idemModel.create.mockResolvedValue({});
    idemModel.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ acknowledged: true }),
    });
    idemModel.deleteOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ acknowledged: true }),
    });

    service = new OrdersService(
      orderModel as unknown as Model<OrderDocument>,
      idemModel as unknown as Model<IdempotencyRecordDocument>,
      cartService as unknown as CartService,
      productService as unknown as ProductsService,
      connection as unknown as Connection,
      config as unknown as ConfigService,
    );
  });

  it('Thiếu header → BadRequestException', async () => {
    const userId = new mongoose.Types.ObjectId().toString();

    await expect(service.checkout(userId, undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(idemModel.create).not.toHaveBeenCalled();
    expect(productService.holdStock).not.toHaveBeenCalled();
  });

  it('Duplicate key completed → trả order cũ, không gọi holdStock', async () => {
    const userId = new mongoose.Types.ObjectId();
    const orderId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    const duplicateError = Object.assign(new Error('E11000 duplicate'), {
      code: 11000,
    });
    idemModel.create.mockRejectedValue(duplicateError);
    idemModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        userId,
        key: IDEMPOTENCY_KEY,
        status: IdempotencyStatus.Completed,
        orderId,
      }),
    });
    const order = {
      _id: orderId,
      userId,
      items: [
        {
          productId,
          quantity: 1,
          name: 'Áo thun',
          unitPrice: 100_000,
        },
      ],
      total: 100_000,
      status: OrderStatus.PendingPayment,
    };
    orderModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(order),
    });

    const result = await service.checkout(userId.toString(), IDEMPOTENCY_KEY);

    expect(idemModel.findOne).toHaveBeenCalledWith({
      userId,
      key: IDEMPOTENCY_KEY,
    });
    expect(orderModel.findById).toHaveBeenCalledWith(orderId);
    expect(productService.holdStock).not.toHaveBeenCalled();
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: orderId.toString(),
      userId: userId.toString(),
      items: [
        {
          productId: productId.toString(),
          quantity: 1,
          name: 'Áo thun',
          unitPrice: 100_000,
        },
      ],
      total: 100_000,
      status: OrderStatus.PendingPayment,
    });
  });

  it('Duplicate key started → ConflictException', async () => {
    const userId = new mongoose.Types.ObjectId();
    const duplicateError = Object.assign(new Error('E11000 duplicate'), {
      code: 11000,
    });
    idemModel.create.mockRejectedValue(duplicateError);
    idemModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        userId,
        key: IDEMPOTENCY_KEY,
        status: IdempotencyStatus.Started,
        orderId: null,
      }),
    });

    await expect(
      service.checkout(userId.toString(), IDEMPOTENCY_KEY),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(productService.holdStock).not.toHaveBeenCalled();
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(orderModel.findById).not.toHaveBeenCalled();
  });

  it('Cart trống → BadRequestException', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    cartService.getItemsOrEmpty.mockResolvedValue([]);

    await expect(
      service.checkout(userId, IDEMPOTENCY_KEY),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(idemModel.create).toHaveBeenCalled();
    expect(cartService.getItemsOrEmpty).toHaveBeenCalledWith(userId, session);
    expect(productService.holdStock).not.toHaveBeenCalled();
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(idemModel.deleteOne).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it('holdStock reject Conflict → không gọi orderModel.create', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const productId = new mongoose.Types.ObjectId();
    cartService.getItemsOrEmpty.mockResolvedValue([
      {
        productId,
        quantity: 2,
        name: 'Áo thun',
        unitPrice: 100_000,
      },
    ]);
    productService.holdStock.mockRejectedValue(
      new ConflictException('Insufficient stock'),
    );

    await expect(
      service.checkout(userId, IDEMPOTENCY_KEY),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(productService.holdStock).toHaveBeenCalledWith(
      productId.toString(),
      2,
      session,
    );
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(cartService.clearItems).not.toHaveBeenCalled();
    expect(idemModel.deleteOne).toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });

  it('Secret sai → UnauthorizedException', async () => {
    await expect(
      service.handlePaymentWebhook('wrong-secret', {
        orderId: new mongoose.Types.ObjectId().toString(),
        result: 'failed',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(config.getOrThrow).toHaveBeenCalledWith('PAYMENT_WEBHOOK_SECRET');
    expect(connection.startSession).not.toHaveBeenCalled();
    expect(orderModel.findById).not.toHaveBeenCalled();
    expect(productService.releaseStock).not.toHaveBeenCalled();
  });

  it('failed từ pending_payment → gọi releaseStock, status cancelled', async () => {
    const orderId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    const order = {
      _id: orderId,
      userId,
      items: [
        {
          productId,
          quantity: 2,
          name: 'Áo thun',
          unitPrice: 100_000,
        },
      ],
      total: 200_000,
      status: OrderStatus.PendingPayment,
      save: jest.fn().mockResolvedValue(undefined),
    };
    orderModel.findById.mockReturnValue({
      session: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(order),
    });
    productService.releaseStock.mockResolvedValue(undefined);

    const result = await service.handlePaymentWebhook(WEBHOOK_SECRET, {
      orderId: orderId.toString(),
      result: 'failed',
    });

    expect(productService.releaseStock).toHaveBeenCalledWith(
      productId.toString(),
      2,
      session,
    );
    expect(order.status).toBe(OrderStatus.Cancelled);
    expect(order.save).toHaveBeenCalledWith({ session });
    expect(result).toEqual({
      id: orderId.toString(),
      userId: userId.toString(),
      items: [
        {
          productId: productId.toString(),
          quantity: 2,
          name: 'Áo thun',
          unitPrice: 100_000,
        },
      ],
      total: 200_000,
      status: OrderStatus.Cancelled,
    });
    expect(session.endSession).toHaveBeenCalled();
  });
});
