# NOTES

## Learner
- Học bằng **tiếng Việt**; thích bản chất + vì sao; ghét học vẹt.
- Prefer TypeScript; NestJS; Kafka từ zero.
- Deadline phỏng vấn cuối tháng 8/2026 → Sprint A ưu tiên interview + order flow MVP.

## Teaching prefs (từ session)
- Chế độ dự án song song: **BẬT** — ShopStream.
- Cắt frontend/mobile.
- Đánh giá thật lòng; challenge mode khi vững.

## Pace estimate
- 1–2h/ngày × ~26 ngày đến cuối tháng 8 ≈ 25–50 giờ.
- Sprint A nhắm ~22–28 bài nhỏ (interview-ready + order flow chạy).
- Sprint B tiếp tục sau phỏng vấn tới mức senior vững.

## Machine probe (2026-08-05)
- Node v22.21.0 (nvm), npm 10.9.4, Nest CLI 11.0.24
- Docker 29.4.0, Compose v5.1.2
- Không Java host → Kafka qua Docker
- Không mongosh host → docker exec
- Verify Bài 00: mongo:7.0 + apache/kafka:4.3.1 + Nest11 + mongoose@9 → /health ok

## Decisions locked
- Mongo giữ (cty target dùng Mongo)
- Tên dự án: ShopStream
- Git: đã init; commit theo bài khi học viên xác nhận hoàn thành; push khi có remote
