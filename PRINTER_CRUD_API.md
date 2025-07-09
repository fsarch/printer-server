# Printer CRUD Endpoints

This implementation provides full CRUD (Create, Read, Update, Delete) operations for printers following the material-tracing-server structure and conventions.

## Authorization

All printer endpoints require authorization using Bearer Token authentication. Users must have the `manage_printers` role to access any of the printer endpoints.

### Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

### Required Role
- `manage_printers`: Required for all printer CRUD operations

## API Endpoints

### Base URL: `/v1/printers`

| Method | Endpoint | Description | Authorization | Request Body | Response |
|--------|----------|-------------|---------------|--------------|----------|
| POST | `/v1/printers` | Create a new printer | manage_printers | CreatePrinterDto | PrinterDto |
| GET | `/v1/printers` | Get all printers | manage_printers | - | PrinterDto[] |
| GET | `/v1/printers/:id` | Get printer by ID | manage_printers | - | PrinterDto |
| PATCH | `/v1/printers/:id` | Update printer | manage_printers | PatchPrinterDto | PrinterDto |
| DELETE | `/v1/printers/:id` | Delete printer | manage_printers | - | 204 No Content |

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

## Error Responses

### Authorization Errors

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 401 | Unauthorized - Missing or invalid authentication token | `{ "statusCode": 401, "message": "Unauthorized" }` |
| 403 | Forbidden - User lacks required role (`manage_printers`) | `{ "statusCode": 403, "message": "Forbidden resource" }` |

### Common Errors

| Status Code | Description | Response Body |
|-------------|-------------|---------------|
| 400 | Bad Request - Invalid input data | `{ "statusCode": 400, "message": ["validation errors"], "error": "Bad Request" }` |
| 404 | Not Found - Printer does not exist | `{ "statusCode": 404, "message": "Printer not found" }` |
| 422 | Unprocessable Entity - Business logic validation error | `{ "statusCode": 422, "message": "error details" }` |

## Usage Examples

### Create a Printer
```bash
POST /v1/printers
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "printerTypeId": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Office Printer 1",
  "externalId": "PRINTER-001"
}
```

### Get All Printers
```bash
GET /v1/printers
Authorization: Bearer <your-jwt-token>
```

### Get Printer by ID
```bash
GET /v1/printers/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your-jwt-token>
```

### Update Printer
```bash
PATCH /v1/printers/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json
Authorization: Bearer <your-jwt-token>

{
  "name": "Updated Printer Name"
}
```

### Delete Printer
```bash
DELETE /v1/printers/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your-jwt-token>
```

## Testing

Run the tests with:
```bash
npm test -- src/repositories/printer.service.spec.ts
npm test -- src/controllers/printers.controller.spec.ts
```

## Swagger Documentation

When the server is running, visit `/docs` to see the interactive API documentation.