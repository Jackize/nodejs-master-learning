# ShopStream

NestJS B2C marketplace backend — dự án học song song khoá Node.js + Kafka.

## Stack (Bài 00)

- NestJS 11 + TypeScript
- MongoDB 7 (Docker)
- Apache Kafka 4.3.1 KRaft (Docker) — chưa wire vào Nest (Module 3)

## Chạy local

```bash
# Từ thư mục shopstream/
docker compose up -d
cd api && cp -n .env.example .env
npm install
npm run start:dev
```

Sanity check: `curl http://localhost:3000/health` → `{"ok":true,"mongo":"up",...}`
