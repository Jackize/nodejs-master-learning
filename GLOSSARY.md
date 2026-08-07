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
| **Unit test** | Test một đơn vị + mock dependency; nhanh, không cần Docker. |
| **getConnectionToken()** | Token DI của connection Mongoose mặc định — dùng để mock trong test Health. |
| **TestingModule** | Module Nest dựng bởi `Test.createTestingModule` cho unit/integration test. |
| **exports (module)** | Public API của module: provider được export mới inject được ở module khác khi import. |
| **Shared module / singleton provider** | Import module đã export → cùng một instance service (tránh Map/state lệch). |
| **DTO** | Class mô tả shape input/output HTTP; kết hợp decorator `class-validator`. |
| **ValidationPipe** | Pipe Nest validate/transform body theo DTO; thường `whitelist` + `forbidNonWhitelisted`. |
| **Exception filter** | Bắt exception HTTP và format JSON lỗi thống nhất (statusCode, message, …). |
| **Mongoose schema** | Định nghĩa shape document Mongo (Nest: `@Schema` / `@Prop` / `SchemaFactory`). |
| **Compound index** | Index nhiều field (vd `{ stock: 1, price: 1 }`) khớp filter+sort theo thứ tự prefix. |
| **getModelToken** | Token DI của Mongoose model — mock trong unit test thay vì nối DB. |
