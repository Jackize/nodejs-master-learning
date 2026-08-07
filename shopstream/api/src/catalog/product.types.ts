/** Kiểu domain tối thiểu — Bài 04 siết ValidationPipe; Bài 05 → Mongo schema */

export type ProductResponse = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export type PaginatedProducts = {
  data: ProductResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};
