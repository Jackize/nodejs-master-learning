import { envValidationSchema } from './env.validation';

describe('envValidationSchema', () => {
  it('pass khi có MONGODB_URI', () => {
    const { error, value } = envValidationSchema.validate({
      MONGODB_URI: 'mongodb://127.0.0.1:27017/shopstream',
    });
    expect(error).toBeUndefined();
    expect(value.MONGODB_URI).toContain('mongodb://');
    expect(value.PORT).toBe(3000); // default
  });

  it('fail khi thiếu MONGODB_URI', () => {
    const { error } = envValidationSchema.validate({
      NODE_ENV: 'development',
    });
    expect(error).toBeDefined();
    expect(error?.message).toMatch(/MONGODB_URI/);
  });
});
