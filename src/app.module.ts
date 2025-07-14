import { Module } from '@nestjs/common';
import { FsarchModule } from './fsarch/fsarch.module.js';
import { BaseTables1720373216667 } from './database/migrations/1733690865449-base-tables.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrintJob } from './database/entities/print_job.entity.js';
import { PrintJobType } from './database/entities/print_job_type.entity.js';
import { Printer } from './database/entities/printer.entity.js';
import { PrinterCredential } from './database/entities/printer_credential.entity.js';
import { PrinterType } from './database/entities/printer_type.entity.js';
import { ReceiptPrintJob } from './database/entities/receipt_print_job.entity.js';
import { PrintersModule } from './controllers/printers.module.js';
import { PrintJobsModule } from './controllers/print-jobs.module.js';

@Module({
  imports: [
    FsarchModule.register({
      auth: {},
      uac: {
        roles: ['manage_claims', 'manage_printers'],
      },
      database: {
        entities: [
          PrintJob,
          PrintJobType,
          Printer,
          PrinterCredential,
          PrinterType,
          ReceiptPrintJob,
        ],
        migrations: [BaseTables1720373216667],
      },
    }),
    EventEmitterModule.forRoot(),
    PrintersModule,
    PrintJobsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
