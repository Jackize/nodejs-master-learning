import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { PaginatedProducts, ProductResponse } from './product.types';
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

  async findAll(query: ListProductsQueryDto): Promise<PaginatedProducts> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const filter = { deletedAt: null };
    const [docs, total] = await Promise.all([
      this.productModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter).exec(),
    ]);
    return {
      data: docs.map((d) => this.toResponse(d)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async create(input: CreateProductDto): Promise<ProductResponse> {
    const doc = await this.productModel.create({ ...input, deletedAt: null });
    return this.toResponse(doc);
  }

  async findById(id: string): Promise<ProductResponse | undefined> {
    const doc = await this.productModel
      .findOne({ _id: id, deletedAt: null })
      .exec();
    return doc ? this.toResponse(doc) : undefined;
  }

  async softDelete(id: string): Promise<void> {
    const doc = await this.productModel
      .findOneAndUpdate(
        {
          _id: id,
          deletedAt: null,
        },
        {
          deletedAt: new Date(),
        },
        { new: true },
      )
      .exec();
    if (!doc) throw new NotFoundException('Product not found');
  }
}
