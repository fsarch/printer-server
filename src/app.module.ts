import { Module } from '@nestjs/common';
import { FsarchModule } from './fsarch/fsarch.module.js';
import { BaseTables1720373216667 } from "./database/migrations/1733690865449-base-tables.js";
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrintJob } from "./database/entities/print_job.entity";
import { PrintJobType } from "./database/entities/print_job_type.entity";
import { Printer } from "./database/entities/printer.entity";
import { PrinterCredential } from "./database/entities/printer_credential.entity";
import { PrinterType } from "./database/entities/printer_type.entity";
import { ReceiptPrintJob } from "./database/entities/receipt_print_job.entity";
import { PrintersModule } from "./controllers/printers.module.js";

@Module({
  imports: [
    FsarchModule.register({
      auth: {},
      database: {
        entities: [
          PrintJob,
          PrintJobType,
          Printer,
          PrinterCredential,
          PrinterType,
          ReceiptPrintJob,
        ],
        migrations: [
          BaseTables1720373216667,
        ],
      },
    }),
    EventEmitterModule.forRoot(),
    PrintersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
