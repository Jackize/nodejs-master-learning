# Bài 14 hoàn thành — Mini-recall Module 2

Học viên làm quiz Module 2 + trả lời T1/T2 trong chat.

**T1 (đạt, có tinh chỉnh):** Chọn lưu DB rồi emit (hướng outbox/Kafka): tin cậy hơn, có thể replay từ DB; phức tạp và có thể chậm hơn. Emit sync trong webhook: nhanh/đơn giản nhưng mất event khó recover. Đúng trade-off.

**Bổ sung:** “Update paid rồi `await kafka.send`” vẫn là **dual-write** — crash giữa commit DB và publish vẫn lệch. Outbox = ghi event cùng transaction với đổi status, worker/Kafka publish sau — đó mới là bước tin cậy mà Module 3 sẽ nhắm.

**T2 (đạt):** MVP chấp nhận first-wins khi 2 checkout khác Idempotency-Key cùng cart. Hợp lý: `holdStock` atomic + clear cart sau checkout đã cho second request fail (409 stock / 400 empty cart). Lock cart riêng chưa cần trước Kafka.

**Implications:** Module 2 đóng về mặt domain order/payment; sẵn sàng Bài 15 Kafka zero (topic & consumer group).
