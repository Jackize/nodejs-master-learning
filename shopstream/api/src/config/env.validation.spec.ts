import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  const validBase = {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/shopstream',
    JWT_SECRET: 'dev-secret-at-least-16-chars',
    PAYMENT_WEBHOOK_SECRET: 'payment-webhook-secret-16+',
  };

  it('pass khi có MONGODB_URI, JWT_SECRET và PAYMENT_WEBHOOK_SECRET', () => {
    const { error, value } = envValidationSchema.validate(validBase);
    expect(error).toBeUndefined();
    expect(value.MONGODB_URI).toContain('mongodb://');
    expect(value.PORT).toBe(3000); // default
    expect(value.JWT_EXPIRES_IN).toBe(86400);
    expect(value.PAYMENT_WEBHOOK_SECRET).toBe(validBase.PAYMENT_WEBHOOK_SECRET);
  });

  it('fail khi thiếu MONGODB_URI', () => {
    const { error } = envValidationSchema.validate({
      NODE_ENV: 'development',
      JWT_SECRET: 'dev-secret-at-least-16-chars',
      PAYMENT_WEBHOOK_SECRET: 'payment-webhook-secret-16+',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/MONGODB_URI/);
  });

  it('fail khi thiếu JWT_SECRET', () => {
    const { error } = envValidationSchema.validate({
      MONGODB_URI: 'mongodb://127.0.0.1:27017/shopstream',
      PAYMENT_WEBHOOK_SECRET: 'payment-webhook-secret-16+',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/JWT_SECRET/);
  });

  it('fail khi thiếu PAYMENT_WEBHOOK_SECRET', () => {
    const { error } = envValidationSchema.validate({
      MONGODB_URI: 'mongodb://127.0.0.1:27017/shopstream',
      JWT_SECRET: 'dev-secret-at-least-16-chars',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/PAYMENT_WEBHOOK_SECRET/);
  });

  it('fail khi PAYMENT_WEBHOOK_SECRET ngắn hơn 16 ký tự', () => {
    const { error } = envValidationSchema.validate({
      ...validBase,
      PAYMENT_WEBHOOK_SECRET: 'too-short',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/PAYMENT_WEBHOOK_SECRET/);
  });
});
