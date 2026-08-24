# FSArch Event Bus Module

This module provides a pluggable event bus abstraction for FSArch.

## Features

- PostgreSQL LISTEN/NOTIFY transport
- Configurable via `config.yaml` section `event_bus`
- `@EventListener('<topic>')` decorator for automatic listener registration
- `EventPublisherService` for publishing events

## Configuration

```yaml
event_bus:
  channel_prefix: printer_server
  connection:
    type: postgres-database
```

Or explicit postgres settings:

```yaml
event_bus:
  channel_prefix: printer_server
  connection:
    type: postgres
    host: db-01
    port: 5432
    username: dev
    password: secret
    database: app
    ssl:
      rejectUnauthorized: false
```

## Enable in FSArch

```typescript
FsarchModule.register({
  auth: {},
  uac: { roles: ['manage_printers'] },
  database: { entities: [], migrations: [] },
  eventBus: {},
});
```

## Publish

```typescript
await this.eventPublisher.publish('print-job.created', { id: '123' });
```

## Listen

```typescript
@EventListener('print-job.created')
async onPrintJobCreated(payload: { id: string }) {
  // handle payload
}
```

