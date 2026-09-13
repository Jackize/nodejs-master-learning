import { Injectable, Logger } from '@nestjs/common';
import { OrderPaidEvent } from './dto/order-paid.event';

@Injectable()
export class NotifyService {
  private readonly logger = new Logger(NotifyService.name);
  /** Ring buffer nhỏ — dễ verify bằng GET (tuỳ chọn nhưng nên có). */
  private readonly recent: OrderPaidEvent[] = [];
  private readonly maxRecent = 20;

  handleOrderPaid(event: OrderPaidEvent): void {
    // Stub notify: production = email/SMS/push. Ở đây log + nhớ gần đây.
    this.logger.log(
      `NOTIFY order.paid orderId=${event.orderId} userId=${event.userId} total=${event.total}`,
    );
    this.recent.unshift(event);
    if (this.recent.length > this.maxRecent) this.recent.pop();
  }

  getRecent(): OrderPaidEvent[] {
    return [...this.recent];
  }
}
