# Bài 02 hoàn thành — testing baseline Nest

Học viên có unit test Health (mock `getConnectionToken` / `readyState` 0 và 1) và test Joi schema (pass có URI / fail thiếu URI). `npm test`: 3 suites, 5 passed, ~0.5s, không cần Docker.

**Evidence:** `health.controller.spec.ts`, `env.validation.spec.ts`; chạy Jest trên máy thật.

**Implications:** Có thể sang Catalog (Bài 03) với lưới an toàn tối thiểu — regression health/config sẽ đỏ trước khi merge logic domain.
