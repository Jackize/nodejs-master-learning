export type CartResponse = {
  id: string;
  userId: string;
  items: {
    productId: string;
    quantity: number;
    name: string;
    unitPrice: number;
  }[];
  total: number;
};
