import { Inject, Injectable } from '@nestjs/common';
import { EVENT_BUS } from './event-bus.constants.js';
import { EventBusService } from './event-bus.types.js';

@Injectable()
export class EventPublisherService {
  constructor(
    @Inject(EVENT_BUS)
    private readonly eventBus: EventBusService,
  ) {}

  async publish<T = unknown>(topic: string, payload: T): Promise<void> {
    await this.eventBus.publish({
      topic,
      payload,
    });
  }
}

