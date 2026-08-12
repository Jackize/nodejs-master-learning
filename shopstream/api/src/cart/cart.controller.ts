import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@Req() req: { user: { userId: string } }) {
    return this.cartService.getCart(req.user.userId);
  }

  @Post('items')
  add(@Req() req: { user: { userId: string } }, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(req.user.userId, dto);
  }

  @Delete('items/:productId')
  remove(
    @Req() req: { user: { userId: string } },
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItem(req.user.userId, productId);
  }
}
