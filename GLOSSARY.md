# Glossary — ShopStream / Node + Kafka

| Thuật ngữ | Nghĩa ngắn (đã dùng đúng trong bài) |
|-----------|-------------------------------------|
| **ShopStream** | Dự án NestJS ecommerce B2C song song khoá học (catalog→cart→order→payment→Kafka notify). |
| **Health check** | Endpoint báo process + dependency tới hạn (vd Mongo) sẵn sàng phục vụ, không chỉ “app còn sống”. |
| **KRaft** | Chế độ Kafka tự quản metadata (không ZooKeeper); image `apache/kafka` local dùng combined broker+controller. |
| **12-factor config** | Cấu hình (URI, PORT…) lấy từ môi trường, không hard-code trong source. |
| **Compose** | Docker Compose: mô tả và chạy nhiều service (Mongo, Kafka) bằng một file. |
| **Fail fast** | Phát hiện config/invariant sai ngay lúc start, không đợi request đầu tiên mới 500. |
| **Feature module** | Module Nest theo domain (Health, Catalog…) — AppModule chỉ compose. |
| **validationSchema (Joi)** | Schema Joi truyền vào ConfigModule để validate env khi bootstrap. |
