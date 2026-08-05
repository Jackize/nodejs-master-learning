/** Kiểu domain tối thiểu — Bài 04 siết ValidationPipe; Bài 05 → Mongo schema */

export type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

/** Class (không phải type-only) để emitDecoratorMetadata hoạt động với @Body() */
export class CreateProductInput {
  name!: string;
  price!: number;
  stock!: number;
}
