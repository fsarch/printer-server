import Joi from 'joi';

// Kept locally: @fsarch/server does not export this validator publicly.
// Used only to validate the `database` config section when the event bus
// is configured to reuse it (event_bus.connection.type=postgres-database).

export const SQLITE_DATABASE_CONFIG_VALIDATOR = Joi.object({
  type: Joi.string().valid('sqlite').required(),
  database: Joi.string().required(),
});

export const COCKROACH_DATABASE_CONFIG_VALIDATOR = Joi.object({
  type: Joi.string().valid('cockroachdb', 'postgres').required(),
  host: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string(),
  database: Joi.string().required(),
  port: Joi.number(),
  ssl: Joi.object({
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
  }),
});

export const DATABASE_CONFIG_VALIDATOR = Joi.alternatives(
  SQLITE_DATABASE_CONFIG_VALIDATOR,
  COCKROACH_DATABASE_CONFIG_VALIDATOR,
);
