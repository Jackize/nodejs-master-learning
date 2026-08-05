import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';

@Controller('catalog/products')
export class ProductsController {
  // Nest inject ProductsService vì cùng CatalogModule khai báo providers
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list() {
    return this.productsService.findAll();
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    // Chưa ValidationPipe — Bài 04 sẽ siết DTO
    return this.productsService.create(body);
  }
}
