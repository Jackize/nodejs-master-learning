# Bài 13 hoàn thành — Webhook HMAC signature

Học viên bật `rawBody: true`, thêm `payment-signature` (HMAC-SHA256 + timingSafeEqual + skew 300s), đổi webhook sang header `x-payment-signature`, bỏ auth secret plaintext.

**Đạt:** Thiếu/sai chữ ký / chỉ `x-payment-secret` / body bị sửa → 401; chữ ký đúng → `paid`.

**Verify:** `npm test` 32/32; curl trên API đang chạy khớp checklist.

**Nhẹ:** Controller dùng `RawBodyRequest<Request>` — nên `import type { Request } from 'express'` cho tường minh (build hiện vẫn xanh).

**Implications:** Module 2 gần đóng; sẵn sàng Bài 14 mini-recall trước Kafka.
