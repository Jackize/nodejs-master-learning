import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ProductsService } from './../catalog/products.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { CartResponse } from './dto/cart-response.types';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectModel(Cart.name)
    private readonly cartModel: Model<CartDocument>,
  ) {}

  private async getOrCreateCart(userId: string): Promise<CartDocument> {
    const uid = new Types.ObjectId(userId);
    let cart = await this.cartModel.findOne({ userId: uid }).exec();
    if (!cart) {
      cart = await this.cartModel.create({ userId: uid, items: [] });
    }
    return cart;
  }

  async addItem(userId: string, dto: AddCartItemDto): Promise<CartResponse> {
    const product = await this.productsService.findById(dto.productId);
    const cart = await this.getOrCreateCart(userId);
    const existing = cart.items.find(
      (i) => String(i.productId) === String(dto.productId),
    );
    if (existing) {
      existing.quantity += dto.quantity;
    } else {
      cart.items.push({
        productId: new Types.ObjectId(dto.productId),
        quantity: dto.quantity,
        name: product.name,
        unitPrice: product.price,
      });
    }
    await cart.save();
    return this.toResponse(cart);
  }

  async removeItem(userId: string, productId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
    const before = cart.items.length;
    cart.items = cart.items.filter(
      (i) => String(i.productId) !== String(productId),
    );
    if (cart.items.length === before) {
      throw new NotFoundException('Item not in cart');
    }
    await cart.save();
    return this.toResponse(cart);
  }

  async getCart(userId: string): Promise<CartResponse> {
    const cart = await this.getOrCreateCart(userId);
    return this.toResponse(cart);
  }

  private toResponse(doc: CartDocument): CartResponse {
    return {
      id: String(doc._id),
      userId: String(doc.userId),
      items: doc.items.map((i) => ({
        productId: String(i.productId),
        quantity: i.quantity,
        name: i.name,
        unitPrice: i.unitPrice,
      })),
      total: doc.items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0),
    };
  }
}
