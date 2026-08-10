import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  const validBase = {
    MONGODB_URI: 'mongodb://127.0.0.1:27017/shopstream',
    JWT_SECRET: 'dev-secret-at-least-16-chars',
  };

  it('pass khi có MONGODB_URI và JWT_SECRET', () => {
    const { error, value } = envValidationSchema.validate(validBase);
    expect(error).toBeUndefined();
    expect(value.MONGODB_URI).toContain('mongodb://');
    expect(value.PORT).toBe(3000); // default
    expect(value.JWT_EXPIRES_IN).toBe(86400);
  });

  it('fail khi thiếu MONGODB_URI', () => {
    const { error } = envValidationSchema.validate({
      NODE_ENV: 'development',
      JWT_SECRET: 'dev-secret-at-least-16-chars',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/MONGODB_URI/);
  });

  it('fail khi thiếu JWT_SECRET', () => {
    const { error } = envValidationSchema.validate({
      MONGODB_URI: 'mongodb://127.0.0.1:27017/shopstream',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/JWT_SECRET/);
  });
});
