import { Body, Controller, Headers, Post } from '@nestjs/common';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { OrdersService } from './orders.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('payment')
  payment(
    @Headers('x-payment-secret') secret: string | undefined,
    @Body() dto: PaymentWebhookDto,
  ) {
    return this.ordersService.handlePaymentWebhook(secret, dto);
  }
}
