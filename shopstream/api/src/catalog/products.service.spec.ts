import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;

  beforeEach(() => {
    service = new ProductsService();
  });

  it('ban đầu danh sách rỗng', () => {
    expect(service.findAll()).toEqual([]);
  });

  it('create rồi findAll trả về sản phẩm vừa tạo', () => {
    const created = service.create({
      name: 'Áo thun',
      price: 199000,
      stock: 10,
    });
    expect(created.id).toBeDefined();
    expect(created.name).toBe('Áo thun');
    expect(service.findAll()).toHaveLength(1);
    expect(service.findById(created.id)).toEqual(created);
  });
});
