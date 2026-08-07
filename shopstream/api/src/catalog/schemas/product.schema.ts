import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 0 })
  stock!: number;

  @Prop({ type: Date, default: null })
  deletedAt?: Date | null;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// create index single field and compound index
ProductSchema.index({ name: 1 });
ProductSchema.index({ stock: 1, price: 1 });
ProductSchema.index({ deletedAt: 1, createdAt: -1 });
