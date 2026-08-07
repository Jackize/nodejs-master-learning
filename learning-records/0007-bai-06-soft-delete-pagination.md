# Bài 06 hoàn thành — soft delete + pagination

Học viên thêm `deletedAt`, list `{ data, meta }` với skip/limit, `DELETE` soft-delete, index `deletedAt_1_createdAt_-1`. Query `page=0&limit=999` → 400. Document xoá vẫn còn trong Mongo với `deletedAt` set; list không còn id đó.

**Evidence:** đọc schema/DTO/service/controller; Jest 7 passed; curl + `getIndexes()` trên máy thật.

**Góp ý:** `findById` trả `undefined` thay vì `NotFoundException` (lệch với `softDelete`); thiếu unit test softDelete→404; comment controller còn “Chưa ValidationPipe”.

**Implications:** Catalog list ổn cho MVP; Bài 07 Auth JWT trước khi Cart/Order ghi.
