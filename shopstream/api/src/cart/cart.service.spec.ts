import { NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { ProductsService } from './../catalog/products.service';
import { CartService } from './cart.service';
import { CartDocument } from './schemas/cart.schema';

describe('CartService', () => {
  let service: CartService;
  const productsService = {
    findById: jest.fn(),
  };
  const cartModel = {
    findOne: jest.fn(),
    create: jest.fn(),
  };

  const mockCart = (overrides: Record<string, unknown> = {}) => {
    const cart = {
      _id: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      items: [] as {
        productId: mongoose.Types.ObjectId | string;
        quantity: number;
        name: string;
        unitPrice: number;
      }[],
      save: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    };
    cart.save.mockResolvedValue(cart);
    return cart;
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CartService(
      productsService as unknown as ProductsService,
      cartModel as unknown as Model<CartDocument>,
    );
  });

  it('getCart trả về cart mới nếu không tồn tại', async () => {
    const uid = new mongoose.Types.ObjectId();

    cartModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
    });

    const created = mockCart({ userId: uid, items: [] });
    cartModel.create.mockResolvedValue(created);

    const result = await service.getCart(uid.toString());

    expect(cartModel.findOne).toHaveBeenCalledWith({
      userId: uid,
    });

    expect(cartModel.create).toHaveBeenCalledWith({
      userId: uid,
      items: [],
    });

    expect(result).toEqual({
      id: String(created._id),
      userId: String(uid),
      items: [],
      total: 0,
    });
  });

  it('getCart trả về cart nếu đã tồn tại', async () => {
    const uid = new mongoose.Types.ObjectId();
    const existing = mockCart({ userId: uid, items: [] });

    cartModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(existing),
    });

    const result = await service.getCart(uid.toString());

    expect(cartModel.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      id: String(existing._id),
      userId: String(uid),
      items: [],
      total: 0,
    });
  });

  it('addItem gọi ProductsService.findById (Catalog gate)', async () => {
    const userId = new mongoose.Types.ObjectId().toString();
    const dto = {
      productId: new mongoose.Types.ObjectId().toString(),
      quantity: 1,
    };

    productsService.findById.mockRejectedValue(
      new NotFoundException('Product not found'),
    );

    await expect(service.addItem(userId, dto)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(productsService.findById).toHaveBeenCalledWith(dto.productId);
    expect(cartModel.findOne).not.toHaveBeenCalled();
  });

  it('addItem thêm sản phẩm mới vào cart', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    const cart = mockCart({ userId, items: [] });

    productsService.findById.mockResolvedValue({
      id: productId.toString(),
      name: 'Product 1',
      price: 100,
    });
    cartModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cart),
    });

    const result = await service.addItem(userId.toString(), {
      productId: productId.toString(),
      quantity: 1,
    });

    expect(productsService.findById).toHaveBeenCalledWith(productId.toString());
    expect(cart.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: String(cart._id),
      userId: String(userId),
      items: [
        {
          productId: productId.toString(),
          quantity: 1,
          name: 'Product 1',
          unitPrice: 100,
        },
      ],
      total: 100,
    });
  });

  it('addItem tăng số lượng sản phẩm nếu đã tồn tại', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    const cart = mockCart({
      userId,
      items: [
        {
          productId,
          quantity: 1,
          name: 'Product 1',
          unitPrice: 100,
        },
      ],
    });

    productsService.findById.mockResolvedValue({
      id: productId.toString(),
      name: 'Product 1',
      price: 100,
    });
    cartModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cart),
    });

    const result = await service.addItem(userId.toString(), {
      productId: productId.toString(),
      quantity: 2,
    });

    expect(cart.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: String(cart._id),
      userId: String(userId),
      items: [
        {
          productId: productId.toString(),
          quantity: 3,
          name: 'Product 1',
          unitPrice: 100,
        },
      ],
      total: 300,
    });
  });

  it('removeItem xóa sản phẩm khỏi cart', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    const cart = mockCart({
      userId,
      items: [
        {
          productId,
          quantity: 1,
          name: 'Product 1',
          unitPrice: 100,
        },
      ],
    });

    cartModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cart),
    });

    const result = await service.removeItem(
      userId.toString(),
      productId.toString(),
    );

    expect(productsService.findById).not.toHaveBeenCalled();
    expect(cart.save).toHaveBeenCalled();
    expect(result).toEqual({
      id: String(cart._id),
      userId: String(userId),
      items: [],
      total: 0,
    });
  });

  it('removeItem throw nếu sản phẩm không có trong cart', async () => {
    const userId = new mongoose.Types.ObjectId();
    const productId = new mongoose.Types.ObjectId();
    const cart = mockCart({ userId, items: [] });

    cartModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(cart),
    });

    await expect(
      service.removeItem(userId.toString(), productId.toString()),
    ).rejects.toThrow(new NotFoundException('Item not in cart'));
    expect(cart.save).not.toHaveBeenCalled();
  });
});
