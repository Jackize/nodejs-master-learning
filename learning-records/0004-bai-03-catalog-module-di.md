# Bài 03 hoàn thành — CatalogModule + DI

Học viên có feature module Catalog: ProductsController/Service, store Map in-memory, `exports: [ProductsService]`, AppModule import CatalogModule. Test 7 passed; build OK; GET `/catalog/products` trả product đã POST trên server đang chạy.

**Evidence:** source `src/catalog/*`, `npm test` 4 suites/7 tests, HTTP list có sản phẩm.

**Implications:** Sẵn sàng Bài 04 (ValidationPipe/DTO) — input hiện chưa bị chặn khi sai kiểu. Mongo persistence vẫn để Bài 05.
