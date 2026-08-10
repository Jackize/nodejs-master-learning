# Bài 08 hoàn thành — mini-recall Module 1

Học viên làm 10 quiz + trả lời T1/T2.

**T1 (đạt):** Chặn product soft-deleted / không tồn tại ở biên Catalog (`findById` → NotFound) khi add-to-cart, fail sớm hơn đợi checkout — đúng hướng UX + domain ownership. Bổ sung: Cart nên gọi `ProductsService` (import CatalogModule), không tự đọc `deletedAt`.

**T2 (đạt một phần):** Chọn guard theo controller Cart/Order hợp lý với app nhỏ hiện tại. Nhưng lập luận “ít code hơn / an toàn hơn global” bị đảo: global `APP_GUARD` + `@Public()` là default-deny (khó quên bảo vệ route mới); per-controller dễ quên gắn guard. Ghi nhận misconception để nhắc khi làm Cart.

**Implications:** Module 1 đóng; sẵn sàng Bài 09 Cart với JwtAuthGuard + ProductsService.
