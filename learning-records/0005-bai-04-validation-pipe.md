# Bài 04 hoàn thành — DTO + ValidationPipe (tự code)

Học viên tự cài `class-validator`/`class-transformer`, viết `CreateProductDto`, bật `ValidationPipe` global (whitelist + forbidNonWhitelisted + transform), và `HttpExceptionFilter`. Curl body xấu → 400 + shape thống nhất; body đẹp → 201 + product. `npm test` 7 passed, build xanh.

**Evidence:** đọc `main.ts`, `dto/create-product.dto.ts`, `http-exception.filter.ts`; chạy Jest + curl trên máy thật.

**Ghi chú / điểm cải (không chặn pass):** Service vẫn type `CreateProductInput`; DTO `stock` dùng `@IsNumber` thay `@IsInt`; comment controller còn “Chưa ValidationPipe”. Nên dọn trước khi Mongo (Bài 05).

**Implications:** Biên HTTP đã khóa; Bài 05 thay RAM bằng schema/index an toàn hơn.
