export type CartItemResponse = {
  productId: string;
  quantity: number;
  name: string;
  unitPrice: number;
};

export type CartResponse = {
  id: string;
  userId: string;
  items: CartItemResponse[];
  total: number;
};
