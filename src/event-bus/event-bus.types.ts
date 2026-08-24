export type EventEnvelope<T = unknown> = {
  topic: string;
  payload: T;
  id?: string;
  timestamp?: string;
};

export type EventSubscription = {
  unsubscribe: () => Promise<void>;
};

export type EventListenerHandler<T = unknown> = (
  event: EventEnvelope<T>,
) => void | Promise<void>;

export interface EventBusService {
  publish<T = unknown>(event: EventEnvelope<T>): Promise<void>;
  subscribe<T = unknown>(
    topic: string,
    handler: EventListenerHandler<T>,
  ): Promise<EventSubscription>;
}

