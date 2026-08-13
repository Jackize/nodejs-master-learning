# Bài 10 hoàn thành — Checkout & inventory hold

Học viên tự dựng `OrdersModule`, Mongo replica set, `holdStock` atomic, và `checkout` trong `session.withTransaction`.

**Đạt:** `POST /order/checkout` (JWT) tạo Order `pending_payment` từ cart snapshot, trừ stock, clear giỏ. Cart trống → 400; thiếu stock → 409 và rollback (stock + cart không lệch).

**Verify:** `npm test` 22/22; curl thật trên app đang chạy: 401 / 400 / 201 / stock=0 sau hold / 409 + stock vẫn 1. RS `rs.status().ok === 1`.

**Nhẹ (không fail):** Route dùng số ít `/order` thay vì `/orders` trong đề bài — hành vi đúng. `OrdersModule` chưa import `AuthModule` (vẫn chạy vì Auth đã gắn ở AppModule); nên import tường minh cho đồng bộ với Cart.

**Implications:** Sẵn sàng Bài 11 — chuyển status / payment webhook stub + câu hỏi release stock khi không thanh toán.
