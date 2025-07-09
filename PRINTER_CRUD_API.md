# Printer CRUD Endpoints

This implementation provides full CRUD (Create, Read, Update, Delete) operations for printers following the material-tracing-server structure and conventions.

## API Endpoints

### Base URL: `/v1/printers`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| POST | `/v1/printers` | Create a new printer | CreatePrinterDto | PrinterDto |
| GET | `/v1/printers` | Get all printers | - | PrinterDto[] |
| GET | `/v1/printers/:id` | Get printer by ID | - | PrinterDto |
| PATCH | `/v1/printers/:id` | Update printer | PatchPrinterDto | PrinterDto |
| DELETE | `/v1/printers/:id` | Delete printer | - | 204 No Content |

## Data Models

### CreatePrinterDto
```typescript
{
  printerTypeId: string;    // UUID - Required
  name: string;            // String (max 512 chars) - Required
  externalId?: string;     // String (max 256 chars) - Optional
}
```

### PatchPrinterDto
```typescript
{
  printerTypeId?: string;  // UUID - Optional
  name?: string;           // String (max 512 chars) - Optional
  externalId?: string;     // String (max 256 chars) - Optional
}
```

### PrinterDto (Response)
```typescript
{
  id: string;              // UUID
  printerTypeId: string;   // UUID
  name: string;            // String
  externalId: string | null; // String or null
  creationTime: Date;      // ISO 8601 timestamp
  deletionTime: Date | null; // ISO 8601 timestamp or null
}
```

## Architecture

### Folder Structure
```
src/
├── controllers/
│   ├── printers.controller.ts      # REST endpoints
│   ├── printers.controller.spec.ts # Controller tests
│   └── printers.module.ts          # Controller module
├── repositories/
│   ├── printer.service.ts          # Business logic
│   ├── printer.service.spec.ts     # Service tests
│   └── printer.module.ts           # Service module
└── models/
    └── printer.dto.ts               # DTOs and validation
```

### Features
- **Full TypeScript support** with strict typing
- **Input validation** using class-validator decorators
- **Swagger/OpenAPI documentation** with ApiProperty decorators
- **Error handling** with proper HTTP status codes
- **Soft delete** support (uses TypeORM's @DeleteDateColumn)
- **UUID validation** for all ID parameters
- **Comprehensive unit tests** for both service and controller layers

### Service Methods
- `CreatePrinter(dto)` - Creates a new printer
- `GetById(id)` - Retrieves printer by ID (throws NotFoundException if not found)
- `ListPrinters()` - Returns all printers ordered by creation time (newest first)
- `UpdatePrinter(id, dto)` - Updates printer fields
- `DeleteById(id)` - Soft deletes printer

### Dependencies
- **NestJS** framework with decorators
- **TypeORM** for database operations
- **class-validator** for DTO validation
- **Swagger** for API documentation
- **Jest** for unit testing

## Usage Examples

### Create a Printer
```bash
POST /v1/printers
Content-Type: application/json

{
  "printerTypeId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Office Printer 1",
  "externalId": "PRINTER-001"
}
```

### Get All Printers
```bash
GET /v1/printers
```

### Get Printer by ID
```bash
GET /v1/printers/123e4567-e89b-12d3-a456-426614174000
```

### Update Printer
```bash
PATCH /v1/printers/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "name": "Updated Printer Name"
}
```

### Delete Printer
```bash
DELETE /v1/printers/123e4567-e89b-12d3-a456-426614174000
```

## Testing

Run the tests with:
```bash
npm test -- src/repositories/printer.service.spec.ts
npm test -- src/controllers/printers.controller.spec.ts
```

## Swagger Documentation

When the server is running, visit `/docs` to see the interactive API documentation.