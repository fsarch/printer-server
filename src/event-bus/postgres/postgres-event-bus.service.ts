import { Inject, Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Client, type ClientConfig } from 'pg';
import { EVENT_BUS_POSTGRES_CONFIG } from '../event-bus.constants.js';
import {
  EventBusService,
  EventEnvelope,
  EventListenerHandler,
  EventSubscription,
} from '../event-bus.types.js';

type PostgresEventBusConfig = {
  channelPrefix: string;
  connection: ClientConfig;
};

@Injectable()
export class PostgresEventBusService implements EventBusService, OnModuleDestroy {
  private readonly logger = new Logger(PostgresEventBusService.name);
  private readonly handlers = new Map<string, Set<EventListenerHandler>>();
  private readonly publisherClient: Client;
  private readonly listenerClient: Client;
  private initializationPromise?: Promise<void>;

  constructor(
    @Inject(EVENT_BUS_POSTGRES_CONFIG)
    private readonly config: PostgresEventBusConfig,
  ) {
    this.publisherClient = new Client(this.config.connection);
    this.listenerClient = new Client(this.config.connection);
  }

  async publish<T = unknown>(event: EventEnvelope<T>): Promise<void> {
    await this.ensureInitialized();

    const normalizedEvent: EventEnvelope<T> = {
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
    };

    await this.publisherClient.query('SELECT pg_notify($1, $2)', [
      this.toChannelName(normalizedEvent.topic),
      JSON.stringify(normalizedEvent),
    ]);
  }

  async subscribe<T = unknown>(
    topic: string,
    handler: EventListenerHandler<T>,
  ): Promise<EventSubscription> {
    await this.ensureInitialized();

    const channel = this.toChannelName(topic);

    let channelHandlers = this.handlers.get(channel);
    if (!channelHandlers) {
      channelHandlers = new Set<EventListenerHandler>();
      this.handlers.set(channel, channelHandlers);
      await this.listenerClient.query(`LISTEN ${this.escapeIdentifier(channel)}`);
    }

    channelHandlers.add(handler as EventListenerHandler);

    return {
      unsubscribe: async () => {
        await this.unsubscribe(channel, handler as EventListenerHandler);
      },
    };
  }

  async onModuleDestroy(): Promise<void> {
    this.handlers.clear();

    try {
      await this.listenerClient.end();
    } catch (error) {
      this.logger.warn(
        `Failed to close postgres event listener connection: ${String(error)}`,
      );
    }

    try {
      await this.publisherClient.end();
    } catch (error) {
      this.logger.warn(
        `Failed to close postgres event publisher connection: ${String(error)}`,
      );
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }

    await this.initializationPromise;
  }

  private async initialize(): Promise<void> {
    await this.publisherClient.connect();
    await this.listenerClient.connect();

    this.listenerClient.on('notification', (message) => {
      const channel = message.channel;
      const payload = message.payload;

      if (!payload) {
        return;
      }

      const handlers = this.handlers.get(channel);
      if (!handlers || handlers.size === 0) {
        return;
      }

      let parsedEvent: EventEnvelope;
      try {
        parsedEvent = JSON.parse(payload) as EventEnvelope;
      } catch {
        this.logger.warn(
          `Dropping invalid event payload on channel "${channel}"`,
        );
        return;
      }

      for (const handler of handlers) {
        Promise.resolve(handler(parsedEvent)).catch((error) => {
          this.logger.error(
            `Event handler failed for channel "${channel}"`,
            error instanceof Error ? error.stack : undefined,
          );
        });
      }
    });

    this.listenerClient.on('error', (error) => {
      this.logger.error(
        'Postgres LISTEN connection error',
        error instanceof Error ? error.stack : undefined,
      );
    });

    this.publisherClient.on('error', (error) => {
      this.logger.error(
        'Postgres NOTIFY connection error',
        error instanceof Error ? error.stack : undefined,
      );
    });
  }

  private async unsubscribe(
    channel: string,
    handler: EventListenerHandler,
  ): Promise<void> {
    const channelHandlers = this.handlers.get(channel);
    if (!channelHandlers) {
      return;
    }

    channelHandlers.delete(handler);

    if (channelHandlers.size > 0) {
      return;
    }

    this.handlers.delete(channel);
    await this.listenerClient.query(`UNLISTEN ${this.escapeIdentifier(channel)}`);
  }

  private toChannelName(topic: string): string {
    const sanitizedTopic = topic
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .replace(/_+/g, '_');

    return `${this.config.channelPrefix}_${sanitizedTopic}`;
  }

  private escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }
}

