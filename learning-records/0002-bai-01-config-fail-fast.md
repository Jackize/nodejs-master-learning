# Bài 01 hoàn thành — config fail-fast + HealthModule

Học viên (và codebase) đã có Joi `validationSchema` bắt buộc `MONGODB_URI`, `HealthModule` tách khỏi AppModule, `getOrThrow` cho URI. Fail-fast được chứng minh: start thiếu URI → `Config validation error: "MONGODB_URI" is required`; đủ env thì `/health` mongo up.

**Evidence:** source `env.validation.ts` / `health.module.ts` / `app.module.ts`; curl health ok; tái hiện lỗi validation trên máy.

**Implications:** Bài 02 có thể khóa thói quen test (Health unit + schema) trước khi viết Catalog — tránh regression im lặng.
