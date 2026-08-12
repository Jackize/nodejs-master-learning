# Bài 09 hoàn thành — Cart model & add/remove

Học viên tự triển khai `CartModule`, schema giỏ hàng, DTO validation, các route add/get/remove và unit test.

**Đạt:** Một cart / user với `userId` dạng `ObjectId`; toàn bộ `/cart` được bảo vệ bởi `JwtAuthGuard`; add item đi qua Catalog gate, snapshot `name` + `unitPrice`, và cộng quantity khi product đã tồn tại.

**Đạt:** DTO chặn productId không phải MongoId và quantity không phải số nguyên dương; response map ObjectId thành string; remove item thiếu trả `NotFoundException('Item not in cart')`.

**Verify:** `npm test` — 20/20 test xanh; `npm run build` xanh. Có unit test xác nhận soft-deleted/missing product dừng tại `ProductsService.findById` trước khi đọc cart.

**Lưu ý cho Bài 10:** Cart snapshot giá phục vụ checkout; thao tác remove không phụ thuộc trạng thái sống/xóa mềm của Product.

**Implications:** Bài 09 đóng; sẵn sàng Bài 10 Checkout & inventory hold.
