// Kept locally: @fsarch/server does not export its config.type.ts publicly.
// Slimmed down to only what the event bus needs.

export type ConfigDatabaseType =
  | ConfigSqliteDatabaseType
  | ConfigCockroachdbDatabaseType;

type ConfigSqliteDatabaseType = {
  type: 'sqlite';
  database: string;
};

type ConfigCockroachdbDatabaseType = {
  type: 'cockroachdb' | 'postgres';
  host: string;
  username: string;
  password?: string;
  database: string;
  port?: number;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?:
      | string
      | {
          path: string;
        };
    cert?:
      | string
      | {
          path: string;
        };
    key?:
      | string
      | {
          path: string;
        };
  };
};

export type ConfigEventBusType = {
  channel_prefix: string;
  connection:
    | ConfigEventBusPostgresConnectionType
    | ConfigEventBusPostgresDatabaseConnectionType;
};

type ConfigEventBusPostgresDatabaseConnectionType = {
  type: 'postgres-database';
};

type ConfigEventBusPostgresConnectionType = {
  type: 'postgres';
  host: string;
  username: string;
  password?: string;
  database: string;
  port?: number;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?:
      | string
      | {
          path: string;
        };
    cert?:
      | string
      | {
          path: string;
        };
    key?:
      | string
      | {
          path: string;
        };
  };
};
