import * as Joi from 'joi';

// Schema validate process.env lúc bootstrap — fail fast nếu thiếu biến bắt buộc
export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().port().default(3000),
  // Bắt buộc: không soft-default URI production nhầm sang localhost
  MONGODB_URI: Joi.string().min(1).required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.number().integer().positive().default(86400),
});
