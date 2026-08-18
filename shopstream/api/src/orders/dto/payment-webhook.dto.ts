import { IsIn, IsMongoId } from 'class-validator';

export class PaymentWebhookDto {
  @IsMongoId()
  orderId!: string;

  @IsIn(['paid', 'failed'])
  result!: 'paid' | 'failed';
}
