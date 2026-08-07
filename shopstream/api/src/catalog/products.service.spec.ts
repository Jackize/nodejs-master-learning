import mongoose, { Model } from 'mongoose';
import { ProductsService } from './products.service';
import { ProductDocument } from './schemas/product.schema';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockProductModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    findOne: jest.fn(),
  };
  const mockQuery = (result: any) => ({
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(result),
  });
  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProductsService(
      mockProductModel as unknown as Model<ProductDocument>,
    );
  });

  it('ban đầu danh sách rỗng', async () => {
    mockProductModel.find.mockReturnValue(mockQuery([]));
    mockProductModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(0),
    });
    expect(await service.findAll({ page: 1, limit: 10 })).toEqual({
      data: [],
      meta: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('create rồi findAll trả về sản phẩm vừa tạo', async () => {
    const product = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Áo thun',
      price: 199000,
      stock: 10,
    };
    mockProductModel.create.mockResolvedValue(product);
    mockProductModel.find.mockReturnValue(mockQuery([product]));
    mockProductModel.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(1),
    });
    mockProductModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
    });
    const created = await service.create(product);
    expect(created?.id).toBeDefined();
    expect(created?.name).toBe('Áo thun');
    expect((await service.findAll({ page: 1, limit: 10 })).data.length).toBe(1);
    expect(await service.findById(created?.id)).toEqual(created);
  });
});
