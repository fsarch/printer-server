import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
} from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { EVENT_BUS, EVENT_LISTENER_METADATA } from './event-bus.constants.js';
import {
  EventBusService,
  EventEnvelope,
  EventSubscription,
} from './event-bus.types.js';

type EventListenerMetadata = {
  topic: string;
};

@Injectable()
export class EventListenerRegistryService
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(EventListenerRegistryService.name);
  private readonly subscriptions: Array<EventSubscription> = [];

  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusService,
    private readonly discoveryService: DiscoveryService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const wrappers = [
      ...this.discoveryService.getProviders(),
      ...this.discoveryService.getControllers(),
    ];

    for (const wrapper of wrappers) {
      const { instance } = wrapper;
      if (!instance) {
        continue;
      }

      await this.registerInstanceListeners(instance);
    }
  }

  async onModuleDestroy(): Promise<void> {
    for (const subscription of this.subscriptions) {
      await subscription.unsubscribe();
    }

    this.subscriptions.length = 0;
  }

  private async registerInstanceListeners(instance: object): Promise<void> {
    const prototype = Object.getPrototypeOf(instance) as Record<string, unknown>;
    if (!prototype) {
      return;
    }

    for (const methodName of Object.getOwnPropertyNames(prototype)) {
      if (methodName === 'constructor') {
        continue;
      }

      const method = prototype[methodName];
      if (typeof method !== 'function') {
        continue;
      }

      const metadata = Reflect.getMetadata(
        EVENT_LISTENER_METADATA,
        method,
      ) as EventListenerMetadata | undefined;

      if (!metadata) {
        continue;
      }

      const boundMethod = method.bind(instance) as (
        payload: unknown,
        event: EventEnvelope,
      ) => void | Promise<void>;

      const subscription = await this.eventBus.subscribe(
        metadata.topic,
        async (event) => {
          try {
            await boundMethod(event.payload, event);
          } catch (error) {
            this.logger.error(
              `Event listener failed for topic "${metadata.topic}" on ${instance.constructor.name}.${methodName}`,
              error instanceof Error ? error.stack : undefined,
            );
          }
        },
      );

      this.subscriptions.push(subscription);
    }
  }
}

