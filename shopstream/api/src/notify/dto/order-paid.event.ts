/** Payload value do Bài 16 emit — @Payload() nhận đúng object này. */
export type OrderPaidEvent = {
  orderId: string;
  userId: string;
  total: number;
  status: string;
  paidAt: string;
};
