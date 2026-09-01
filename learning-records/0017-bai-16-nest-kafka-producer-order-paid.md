# Bài 16 hoàn thành — Nest Kafka producer (order.paid)

Học viên nối webhook `paid` với topic `shopstream.order.paid` qua Nest `ClientKafka.emit` (`producerOnlyMode`, key = orderId), emit chỉ khi transition lần đầu.

**Evidence:** Đọc `orders.module.ts` / `orders.service.ts` / constants / env. `npm test` 34 passed, `npm run build` xanh. E2E trên API đang chạy: webhook paid ×2 → đúng 1 message trên broker (`6a96d3d1…|{…status:paid…}`), offset partition 0 tăng 1.

**Implications:** Sẵn sàng Bài 17 — Nest `@EventPattern` consumer + groupId + idempotent handler (at-least-once).
