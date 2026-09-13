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
| **Soft delete** | Đánh dấu xoá (`deletedAt`) thay vì remove document; query active phải lọc. |
| **Offset pagination** | `skip`/`limit` + `total`; đơn giản nhưng deep page kém hiệu năng. |
| **JWT** | Token ký (thường Bearer) mang claim identity (`sub`, `email`); verify bằng secret/public key. |
| **JwtAuthGuard** | Guard Nest/Passport bảo vệ route — thiếu/invalid token → 401. |
| **passwordHash (bcrypt)** | Hash một chiều của password; không lưu plaintext. |
| **Cart snapshot** | Lưu `name`/`unitPrice` trên dòng giỏ lúc add — không phụ thuộc giá catalog đổi sau. |
| **Inventory hold** | Khóa/trừ stock khi checkout (trước paid) để tránh oversell; cần release nếu hủy/timeout. |
| **Replica set (Mongo)** | Cụm Mongo (có thể 1 node) — điều kiện để multi-document transaction chạy. |
| **withTransaction** | Helper session Mongoose: commit/abort (+ retry transient) quanh callback. |
| **pending_payment** | Trạng thái Order sau checkout: hàng đã hold, chờ thanh toán. |
| **Payment webhook** | HTTP callback từ payment provider báo kết quả; auth bằng secret/signature, không JWT user. |
| **Idempotent webhook** | Xử lý trùng event an toàn (vd paid lần 2 trên order đã paid → no-op). |
| **releaseStock** | Hoàn số lượng đã hold khi hủy / payment failed. |
| **Idempotency-Key** | Header client gửi để server nhận diện retry cùng một thao tác; tránh side-effect kép. |
| **Idempotent replay** | Request trùng key trả kết quả đã lưu, không chạy lại logic tạo order/trừ stock. |
| **HMAC (webhook)** | Hash có khoá — chứng minh payload đến từ ai giữ secret và chưa bị sửa. |
| **rawBody** | Bytes body gốc trước/khi parse JSON — bắt buộc để verify chữ ký webhook. |
| **timingSafeEqual** | So sánh buffer không phụ thuộc thời gian theo prefix khớp (giảm timing attack). |
| **Topic** | Tên log append-only trên Kafka (chuỗi event theo domain). |
| **Partition** | Làn song song trong topic; scale consume; cùng key → cùng partition. |
| **Consumer group** | Nhóm consumer chia partitions; cùng group = cạnh tranh; khác group = fan-out độc lập. |
| **Offset** | Vị trí đã commit của group trên một partition — đọc tiếp từ đâu. |
| **ClientKafka / emit** | Nest Kafka client; `emit(pattern, payload)` publish event (pattern ≈ tên topic); không chờ reply. |
| **producerOnlyMode** | Cấu hình Nest Kafka client chỉ producer — không join consumer group. |
| **Keyed message** | Kafka message có `key` (+ `value`); cùng key → cùng partition → giữ thứ tự theo entity. |
| **Dual-write** | Ghi DB rồi publish broker tách biệt (không atomic); mất event nếu emit fail sau commit. |
| **Hybrid application** | Một Nest process vừa HTTP (`listen`) vừa microservice (`connectMicroservice` + `startAllMicroservices`). |
| **@EventPattern** | Handler event-based Nest; với Kafka, pattern thường = tên topic; không chờ reply. |
| **KafkaContext** | Context message Kafka (topic, partition, offset, key…) qua `@Ctx()`. |
