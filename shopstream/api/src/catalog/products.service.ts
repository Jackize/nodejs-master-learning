import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateProductInput, Product } from './product.types';

@Injectable()
export class ProductsService {
  // Store tạm trong RAM — Bài 05 thay bằng Mongo; đủ để học DI/module
  private readonly products = new Map<string, Product>();

  findAll(): Product[] {
    return [...this.products.values()];
  }

  create(input: CreateProductInput): Product {
    const product: Product = {
      id: randomUUID(),
      name: input.name,
      price: input.price,
      stock: input.stock,
    };
    this.products.set(product.id, product);
    return product;
  }

  findById(id: string): Product | undefined {
    return this.products.get(id);
  }
}
