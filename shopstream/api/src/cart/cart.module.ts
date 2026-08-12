import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { CatalogModule } from 'src/catalog/catalog.module';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart, CartSchema } from './schemas/cart.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Cart.name, schema: CartSchema }]),
    CatalogModule, // ProductsService
    AuthModule, // JwtAuthGuard
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], // checkout sau sẽ cần
})
export class CartModule {}
