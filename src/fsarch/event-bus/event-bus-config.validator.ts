import Joi from 'joi';

const SSL_CONFIG_VALIDATOR = Joi.object({
  rejectUnauthorized: Joi.boolean(),
  ca: Joi.alternatives(
    Joi.string(),
    Joi.object({
      path: Joi.string().required(),
    }),
  ),
  key: Joi.alternatives(
    Joi.string(),
    Joi.object({
      path: Joi.string().required(),
    }),
  ),
  cert: Joi.alternatives(
    Joi.string(),
    Joi.object({
      path: Joi.string().required(),
    }),
  ),
});

const EVENT_BUS_CONNECTION_POSTGRES_VALIDATOR = Joi.object({
  type: Joi.string().valid('postgres').required(),
  host: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string(),
  database: Joi.string().required(),
  port: Joi.number(),
  ssl: SSL_CONFIG_VALIDATOR,
});

const EVENT_BUS_CONNECTION_POSTGRES_DATABASE_VALIDATOR = Joi.object({
  type: Joi.string().valid('postgres-database').required(),
});

export const EVENT_BUS_CONFIG_VALIDATOR = Joi.object({
  channel_prefix: Joi.string().required(),
  connection: Joi.alternatives(
    EVENT_BUS_CONNECTION_POSTGRES_VALIDATOR,
    EVENT_BUS_CONNECTION_POSTGRES_DATABASE_VALIDATOR,
  ).required(),
});

