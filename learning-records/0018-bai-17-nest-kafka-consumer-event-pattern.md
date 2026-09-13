# Bài 17 hoàn thành — Nest Kafka consumer (@EventPattern)

Học viên bật hybrid app (`connectMicroservice` + `startAllMicroservices`) và `NotifyModule` với `@EventPattern('shopstream.order.paid')` → log notify stub + `GET /notify/recent`.

**Evidence:** Đọc `main.ts`, `notify/*`, env. `npm test` 35 passed, build xanh. Broker: group `shopstream-notify-v1-server` có member `shopstream-api-server`. E2E webhook paid → `/notify/recent` chứa đúng `orderId` vừa paid.

**Implications:** Vòng paid→Kafka→notify stub đã chạy; Bài 18 idempotent consumer (at-least-once / trùng orderId).
