import mongoose, { Model } from 'mongoose';
import { ProductsService } from './products.service';
import { ProductDocument } from './schemas/product.schema';

describe('ProductsService', () => {
  let service: ProductsService;
  const mockProductModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(() => {
    service = new ProductsService(
      mockProductModel as unknown as Model<ProductDocument>,
    );
  });

  it('ban đầu danh sách rỗng', async () => {
    const execMock = jest.fn().mockResolvedValue([]);
    const sortMock = jest.fn();

    sortMock.mockReturnValue({
      exec: execMock,
    });
    mockProductModel.find.mockReturnValue({
      sort: sortMock,
    });
    expect(await service.findAll()).toEqual([]);
  });

  it('create rồi findAll trả về sản phẩm vừa tạo', async () => {
    const product = {
      _id: new mongoose.Types.ObjectId(),
      name: 'Áo thun',
      price: 199000,
      stock: 10,
    };
    mockProductModel.create.mockResolvedValue(product);
    mockProductModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([product]),
      }),
    });
    mockProductModel.findById.mockReturnValue({
      exec: jest.fn().mockResolvedValue(product),
    });
    const created = await service.create(product);
    expect(created?.id).toBeDefined();
    expect(created?.name).toBe('Áo thun');
    expect((await service.findAll()).length).toBe(1);
    expect(await service.findById(created?.id)).toEqual(created);
  });
});
