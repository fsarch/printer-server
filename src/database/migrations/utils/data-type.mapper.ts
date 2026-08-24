import { DatabaseType } from 'typeorm';

const DATA_TYPES: Record<
  'timestamp' | 'boolean' | 'smallint',
  Record<'cockroachdb' | 'better-sqlite3' | 'postgres', string>
> = {
  timestamp: {
    cockroachdb: 'TIMESTAMPTZ',
    postgres: 'TIMESTAMPTZ',
    'better-sqlite3': 'datetime',
  },
  boolean: {
    cockroachdb: 'BOOL',
    postgres: 'BOOL',
    'better-sqlite3': 'boolean',
  },
  smallint: {
    cockroachdb: 'INT2',
    postgres: 'INT2',
    'better-sqlite3': 'tinyint',
  },
};

export const getDataType = (
  driver: DatabaseType,
  dataType: keyof typeof DATA_TYPES,
) => {
  if (
    driver !== 'cockroachdb' &&
    driver !== 'postgres' &&
    driver !== 'better-sqlite3'
  ) {
    throw new Error('unsupported database type');
  }

  return DATA_TYPES[dataType][driver];
};
