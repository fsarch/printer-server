import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { readFile } from 'node:fs/promises';
import { type ClientConfig } from 'pg';
import { ModuleConfiguration, ModuleConfigurationService } from '@fsarch/server/configuration';
import { ConfigDatabaseType, ConfigEventBusType } from './config.type.js';
import { DATABASE_CONFIG_VALIDATOR } from './database-config.validator.js';
import { EVENT_BUS_CONFIG_VALIDATOR } from './event-bus-config.validator.js';
import {
  EVENT_BUS,
  EVENT_BUS_CONFIG,
  EVENT_BUS_POSTGRES_CONFIG,
} from './event-bus.constants.js';
import { EventPublisherService } from './event-publisher.service.js';
import { EventListenerRegistryService } from './event-listener-registry.service.js';
import { PostgresEventBusService } from './postgres/postgres-event-bus.service.js';

@Module({})
export class EventBusModule {
  static register(): DynamicModule {
    return {
      module: EventBusModule,
      imports: [
        DiscoveryModule,
        ModuleConfiguration.register(EVENT_BUS_CONFIG, {
          validationSchema: EVENT_BUS_CONFIG_VALIDATOR,
          name: 'event_bus',
        }),
      ],
      providers: [
        {
          provide: EVENT_BUS_POSTGRES_CONFIG,
          inject: [EVENT_BUS_CONFIG, ConfigService],
          useFactory: async (
            eventBusConfigService: ModuleConfigurationService<ConfigEventBusType>,
            configService: ConfigService,
          ): Promise<{ channelPrefix: string; connection: ClientConfig }> => {
            const eventBusConfig = eventBusConfigService.get();
            const connectionConfig =
              eventBusConfig.connection.type === 'postgres-database'
                ? getPostgresConnectionFromDatabaseConfig(configService)
                : eventBusConfig.connection;

            return {
              channelPrefix: eventBusConfig.channel_prefix,
              connection: await toClientConfig(connectionConfig),
            };
          },
        },
        PostgresEventBusService,
        {
          provide: EVENT_BUS,
          useExisting: PostgresEventBusService,
        },
        EventPublisherService,
        EventListenerRegistryService,
      ],
      exports: [EVENT_BUS, EventPublisherService],
    };
  }
}

function getPostgresConnectionFromDatabaseConfig(
  configService: ConfigService,
): {
  type: 'postgres';
  host: string;
  username: string;
  password?: string;
  database: string;
  port?: number;
  ssl?: {
    rejectUnauthorized?: boolean;
    ca?: string | { path: string };
    cert?: string | { path: string };
    key?: string | { path: string };
  };
} {
  const databaseConfig = configService.get('database') as ConfigDatabaseType | undefined;

  if (!databaseConfig) {
    throw new Error(
      'event_bus.connection.type=postgres-database requires a database config section',
    );
  }

  const valid = DATABASE_CONFIG_VALIDATOR.validate(databaseConfig, {
    abortEarly: false,
  });
  if (valid.error) {
    throw new Error('invalid database config for event bus');
  }

  if (databaseConfig.type !== 'postgres') {
    throw new Error(
      `event_bus.connection.type=postgres-database requires database.type=postgres but got ${databaseConfig.type}`,
    );
  }

  return {
    type: 'postgres',
    host: databaseConfig.host,
    username: databaseConfig.username,
    password: databaseConfig.password,
    database: databaseConfig.database,
    port: databaseConfig.port,
    ssl: databaseConfig.ssl,
  };
}

async function toClientConfig(
  connection: {
    host: string;
    username: string;
    password?: string;
    database: string;
    port?: number;
    ssl?: {
      rejectUnauthorized?: boolean;
      ca?: string | { path: string };
      cert?: string | { path: string };
      key?: string | { path: string };
    };
  },
): Promise<ClientConfig> {
  const sslOptions: Partial<{
    rejectUnauthorized: boolean;
    ca: string | Buffer;
    cert: string | Buffer;
    key: string | Buffer;
  }> = {};

  if (connection.ssl) {
    if (connection.ssl.rejectUnauthorized === false) {
      sslOptions.rejectUnauthorized = connection.ssl.rejectUnauthorized;
    }

    if (connection.ssl.ca) {
      sslOptions.ca =
        typeof connection.ssl.ca === 'string'
          ? connection.ssl.ca
          : await readFile(connection.ssl.ca.path);
    }

    if (connection.ssl.cert) {
      sslOptions.cert =
        typeof connection.ssl.cert === 'string'
          ? connection.ssl.cert
          : await readFile(connection.ssl.cert.path);
    }

    if (connection.ssl.key) {
      sslOptions.key =
        typeof connection.ssl.key === 'string'
          ? connection.ssl.key
          : await readFile(connection.ssl.key.path);
    }
  }

  return {
    host: connection.host,
    user: connection.username,
    password: connection.password,
    database: connection.database,
    port: connection.port,
    ssl: connection.ssl ? sslOptions : undefined,
  };
}

