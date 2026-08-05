# Mission: Senior Backend Node.js + Kafka (Ecommerce)

## Why
Xin việc / nhảy sang công ty product. Cần chứng minh được tư duy backend senior: thiết kế & ship order flow có Kafka, nói rõ trade-off khi phỏng vấn — không chỉ làm CRUD Nest/Express.

## Success looks like
- Tự thiết kế & ship được order flow (catalog → cart → order → payment webhook → notification) trên NestJS + Kafka, chạy được local bằng Docker.
- Giải thích được (và hiện thực) idempotency, retry, consumer group, at-least-once vs exactly-once-ish, outbox khi cần.
- Pass phỏng vấn backend: system design order/payment + coding Node/TS ở mức production-minded.
- Repo dự án ecommerce dùng được làm portfolio khi xin việc.

## Constraints
- ~1–2 giờ/ngày; deadline phỏng vấn **cuối tháng 8/2026** → ưu tiên Sprint A (interview + order flow MVP) trước, Sprint B (độ sâu senior) sau.
- Prefer **TypeScript**; stack chính **NestJS**.
- Nền: Node/TS ~2 năm + freelance nhỏ; Nest/Express CRUD; Mongo cơ bản; Docker/CI/testing trung bình; **Kafka = zero**.

## Out of scope
- Frontend React sâu, mobile app.
- Kubernetes nâng cao / multi-region (survey ngắn nếu cần phỏng vấn, không đi sâu trước deadline).
- ML / recommendation engine.

## Parallel project
có — **ShopStream**: NestJS B2C marketplace backend (catalog + cart + order + payment webhook + notification qua Kafka); dự án đích thay sân tập trống, mỗi bài đóng góp mẩu chạy được.
