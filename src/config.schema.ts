import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  BASE_URL: Joi.string().required(),
  MONGO_URI: Joi.string().required(),
  REDIS_HOST: Joi.string().required(),
});
