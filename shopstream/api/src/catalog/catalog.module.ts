import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
  // Export để Cart/Order sau này import CatalogModule và inject cùng instance
  exports: [ProductsService],
})
export class CatalogModule {}
