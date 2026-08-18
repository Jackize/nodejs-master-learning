# Bài 11 hoàn thành — Order status & payment webhook stub

Học viên thêm `PAYMENT_WEBHOOK_SECRET`, mở rộng `OrderStatus` (`paid`/`cancelled`), `releaseStock`, và `POST /webhooks/payment` (header secret, không JWT).

**Đạt:** Secret sai/thiếu → 401; `paid` từ `pending_payment` → `paid`; gọi `paid` lại idempotent; `failed` → `cancelled` + hoàn stock; `paid` sau `cancelled` → 409.

**Verify:** `npm test` 26/26; curl trên app đang chạy khớp bảng chuyển trạng thái bài học.

**Implications:** Sẵn sàng Bài 12 — idempotency key HTTP (double-checkout) trước Kafka.
