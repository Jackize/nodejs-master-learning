import { BadRequestException, ConflictException } from '@nestjs/common';
import mongoose, { Connection, Model } from 'mongoose';
import { ProductsService } from '../catalog/products.service';
import { CartService } from '../cart/cart.service';
import { OrdersService } from './orders.service';
import { OrderDocument } from './schemas/order.schema';

describe('OrdersService', () => {
  let service: OrdersService;

  const cartService = {
    getItemsOrEmpty: jest.fn(),
    clearItems: jest.fn(),
  };
  const productService = {
    holdStock: jest.fn(),
  };
  const orderModel = {
    create: jest.fn(),
  };
  const session = {
    withTransaction: jest.fn(async (fn: () => Promise<unknown>) => fn()),
    endSession: jest.fn().mockResolvedValue(undefined),
  };
  const connection = {
    startSession: jest.fn().mockResolvedValue(session),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    connection.startSession.mockResolvedValue(session);
    session.withTransaction.mockImplementation(
      async (fn: () => Promise<unknown>) => fn(),
    );
    session.endSession.mockResolvedValue(undefined);

    service = new OrdersService(
      orderModel as unknown as Model<OrderDocument>,
      cartService as unknown as CartService,
      productService as unknown as ProductsService,
      connection as unknown as Connection,
    );
  });

  it('Cart trống → BadRequestException', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    cartService.getItemsOrEmpty.mockResolvedValue([]);

    await expect(service.checkout(userId)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(cartService.getItemsOrEmpty).toHaveBeenCalledWith(
      userId,
      session,
    );
    expect(productService.holdStock).not.toHaveBeenCalled();
    expect(orderModel.create).not.toHaveBeenCalled();
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

    await expect(service.checkout(userId)).rejects.toBeInstanceOf(
      ConflictException,
    );
    expect(productService.holdStock).toHaveBeenCalledWith(
      productId.toString(),
      2,
      session,
    );
    expect(orderModel.create).not.toHaveBeenCalled();
    expect(cartService.clearItems).not.toHaveBeenCalled();
    expect(session.endSession).toHaveBeenCalled();
  });
});
