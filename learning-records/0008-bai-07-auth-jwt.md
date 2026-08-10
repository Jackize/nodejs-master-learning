# Bài 07 hoàn thành — Auth JWT tối thiểu

Học viên tự dựng Users + Auth: register/login trả accessToken, `/auth/me` bảo vệ bằng JwtAuthGuard, password bcrypt hash trong Mongo, JWT_SECRET required trong Joi. Tests 13 passed; HTTP: register 201, me 401/200, login sai 401.

**Evidence:** đọc `auth/*`, `users/*`, `env.validation.ts`; chạy Jest + curl + mongosh trên máy thật.

**Góp ý:** Cảnh báo Mongoose duplicate index `email` — đang vừa `@Prop({ unique: true })` vừa `UserSchema.index({ email: 1 }, { unique: true })`; giữ một chỗ thôi. `findByEmail` nên `.exec()` cho rõ.

**Implications:** Có `JwtAuthGuard` export — Module 1 gần xong; Bài 08 mini-recall rồi sang Cart (Module 2).
