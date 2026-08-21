# Bài 12 hoàn thành — Idempotency key HTTP (checkout)

Học viên thêm `idempotency_records` (unique `userId+key`), bắt buộc header `Idempotency-Key` trên checkout, claim `started` → complete với `orderId`, replay khi completed, 409 khi in-progress, xóa record khi checkout fail để retry.

**Đạt:** Thiếu key → 400; hai lần cùng key → cùng `order.id`; stock chỉ trừ một lần (10→8 với qty 2); key mới + giỏ trống → 400.

**Verify:** `npm test` 29/29; curl trên API đang chạy khớp checklist bài học.

**Nhẹ:** Có thể `trim()` rồi reject chuỗi rỗng; comment trên `deleteOne` nên nói “checkout fail → cho retry”, không phải “duplicate key”.

**Implications:** Sẵn sàng Bài 13 — webhook HMAC signature.
