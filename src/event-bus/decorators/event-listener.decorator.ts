import { SetMetadata } from '@nestjs/common';
import { EVENT_LISTENER_METADATA } from '../event-bus.constants.js';

export const EventListener = (topic: string) =>
  SetMetadata(EVENT_LISTENER_METADATA, { topic });

