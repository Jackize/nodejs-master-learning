import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponse } from './product.types';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  private toResponse(doc: ProductDocument): ProductResponse {
    return {
      id: String(doc._id),
      name: doc.name,
      price: doc.price,
      stock: doc.stock,
    };
  }

  async findAll(): Promise<ProductResponse[]> {
    const docs = await this.productModel.find().sort({ createdAt: -1 }).exec();
    return docs.map((d) => this.toResponse(d));
  }

  async create(input: CreateProductDto): Promise<ProductResponse> {
    const doc = await this.productModel.create({ ...input });
    return this.toResponse(doc);
  }

  async findById(id: string): Promise<ProductResponse | undefined> {
    const doc = await this.productModel.findById(id).exec();
    return doc ? this.toResponse(doc) : undefined;
  }
}
