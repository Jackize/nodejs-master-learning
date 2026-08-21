import { Controller, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { OrderResponse } from './dto/order-response.type';
import { OrdersService } from './orders.service';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('/checkout')
  checkout(
    @Req() req: { user: { userId: string } },
    @Headers('idempotency-key') idempotencyKey: string | undefined,
  ): Promise<OrderResponse> {
    return this.ordersService.checkout(req.user.userId, idempotencyKey);
  }
}
