import { OrderStatus } from '../schemas/order.schema';

export type OrderItemResponse = {
  productId: string;
  quantity: number;
  name: string;
  unitPrice: number;
};

export type OrderResponse = {
  id: string;
  userId: string;
  items: OrderItemResponse[];
  total: number;
  status: OrderStatus;
};
