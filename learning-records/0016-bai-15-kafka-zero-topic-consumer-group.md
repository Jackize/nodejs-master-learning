# Bài 15 hoàn thành — Kafka zero topic & consumer group

Học viên chạy CLI trên Docker Kafka (`apache/kafka:4.3.1`).

**Đạt (verify trên broker thật):** Topic `shopstream.order.paid` — `PartitionCount: 3`. Có produce (log-end offsets > 0 trên nhiều partition). Consumer group `shopstream-notify-v1` có offset/lag=0 và từng có member active chia partition. Có thêm group `shopstream-analytics-v1` trên cùng topic — đúng thí nghiệm “khác group = fan-out độc lập”.

**Implications:** Topic ShopStream sẵn; Bài 16 Nest Kafka producer publish `shopstream.order.paid` từ webhook paid.
