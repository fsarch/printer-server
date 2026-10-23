import { createServiceModule } from '@fsarch/server';
import { PrintJobsController } from '../controllers/print-jobs.controller.js';
import { PrinterCredentialsController } from '../controllers/printer-credentials.controller.js';
import { PrintersController } from '../controllers/printers.controller.js';
import { DATABASE_OPTIONS } from '../database/index.js';
import { PrintJobService } from '../repositories/print-job.service.js';
import { PrinterService } from '../repositories/printer.service.js';
import { PrinterCredentialService } from '../repositories/printer-credential.service.js';

/**
 * The service's feature module, generated via `@fsarch/server`'s
 * `createServiceModule()` instead of the previous
 * `AppModule -> {PrintersModule, PrintJobsModule}` tree, whose modules each
 * did their own unscoped `TypeOrmModule.forFeature(...)`. Flattened because
 * a single `TypeOrmModule.forFeature(entities, connectionName)` call inside
 * `createServiceModule()` only covers providers/controllers declared
 * directly in the generated module. Every controller declares its full
 * route path itself, so no route changes.
 */
export const PrinterServerModule = createServiceModule({
  entities: DATABASE_OPTIONS.entities,
  controllers: [
    PrintersController,
    PrinterCredentialsController,
    PrintJobsController,
  ],
  providers: [PrinterService, PrinterCredentialService, PrintJobService],
});
