# Bài 05 hoàn thành — Mongo schema + index

Học viên thay Map bằng `Product` schema + `InjectModel`, map `_id`→`id`, indexes `name_1` và `stock_1_price_1`. POST rồi restart Nest → GET vẫn còn; `npm test` 7 passed; build xanh.

**Evidence:** đọc `product.schema.ts` / `products.service.ts` / `catalog.module.ts`; curl + `getIndexes()` trên máy thật.

**Góp ý (không chặn):** `@Prop({ trim: true })` trên `price`/`stock` (number) không hợp lý — nên `min: 0`. Unit test mock `create` thiếu `_id` khiến `id` thành chuỗi `"undefined"` nhưng assertion vẫn pass — nên mock `_id` thật.

**Implications:** Catalog đã persistent; Bài 06 soft-delete/pagination có nền query+index.
