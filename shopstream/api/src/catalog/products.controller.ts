import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { ProductsService } from './products.service';

@Controller('catalog/products')
export class ProductsController {
  // Nest inject ProductsService vì cùng CatalogModule khai báo providers
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  list(@Query() query: ListProductsQueryDto) {
    return this.productsService.findAll(query);
  }

  @Post()
  create(@Body() body: CreateProductDto) {
    // Chưa ValidationPipe — Bài 04 sẽ siết DTO
    return this.productsService.create(body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.productsService.softDelete(id);
    return { ok: true };
  }
}
