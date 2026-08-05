# Node.js + Kafka Backend Resources

## Knowledge

- [NestJS Docs — Overview](https://docs.nestjs.com/)
  Nguồn chính cho module, DI, pipes, guards, testing. Use for: mọi bài Nest.
- [NestJS — Microservices / Kafka](https://docs.nestjs.com/microservices/kafka)
  ClientKafka, MessagePattern/EventPattern, commit offsets. Use for: integrate Kafka vào Nest.
- [Apache Kafka — Introduction](https://kafka.apache.org/intro)
  Topic, partition, consumer group, log. Use for: nền tảng Kafka trước khi code Nest.
- [Apache Kafka — Quickstart](https://kafka.apache.org/quickstart/)
  Chạy broker local / Docker. Use for: Bài 00 và sanity check Kafka.
- [KafkaJS Docs](https://kafka.js.org/)
  Client Node chính thức mà Nest dùng dưới hood. Use for: producer/consumer config, retry.
- [MongoDB Manual — Indexes](https://www.mongodb.com/docs/manual/indexes/)
  Indexing đúng chỗ. Use for: catalog/cart/order query paths.
- [NestJS — Testing](https://docs.nestjs.com/fundamentals/testing)
  Unit + e2e Nest. Use for: nâng testing từ mức trung bình lên production.
- [Twelve-Factor App](https://12factor.net/)
  Config, logs, disposability. Use for: mindset product company / phỏng vấn.

## Wisdom (Communities)

- [r/node](https://www.reddit.com/r/node/)
  Thảo luận Node production. Use for: trade-off thực tế, không chỉ tutorial.
- [NestJS Discord](https://discord.gg/nestjs) (link từ docs.nestjs.com)
  Hỏi pattern Nest cụ thể. Use for: khi kẹt DI / microservices.
- [Confluent Community Forum](https://forum.confluent.io/)
  Kafka ops & semantics. Use for: consumer lag, exactly-once discussions.

## Gaps

- Sách system design ecommerce riêng (Order/Payment) — sẽ bổ sung khi vào module design (ưu tiên bài viết uy tín / kinh nghiệm interview, không blog SEO).
