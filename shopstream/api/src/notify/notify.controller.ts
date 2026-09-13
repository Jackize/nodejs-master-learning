import { Controller, Get, Logger } from '@nestjs/common';
import {
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';
import { ORDER_PAID_TOPIC } from '../messaging/kafka.constants';
import type { OrderPaidEvent } from './dto/order-paid.event';
import { NotifyService } from './notify.service';

@Controller('notify')
export class NotifyController {
  private readonly logger = new Logger(NotifyController.name);

  constructor(private readonly notifyService: NotifyService) {}

  /** HTTP debug — xem event consumer đã xử lý (không phải API public). */
  @Get('recent')
  recent() {
    return { items: this.notifyService.getRecent() };
  }

  /**
   * Pattern string = tên topic Kafka (khớp emit Bài 16).
   * @Payload() = value object (đã verify), không phải cả {key,value}.
   */
  @EventPattern(ORDER_PAID_TOPIC)
  handleOrderPaid(
    @Payload() payload: OrderPaidEvent,
    @Ctx() context: KafkaContext,
  ): void {
    const original = context.getMessage();
    const key = original.key?.toString();
    this.logger.debug(
      `kafka ${context.getTopic()} p=${context.getPartition()} off=${original.offset} key=${key}`,
    );
    if (!payload?.orderId) {
      this.logger.warn('Skip order.paid — thiếu orderId');
      return;
    }
    this.notifyService.handleOrderPaid(payload);
  }
}
