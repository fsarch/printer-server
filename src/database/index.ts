import { BaseTables1720373216667 } from './migrations/1733690865449-base-tables.js';
import { PrintJob } from './entities/print_job.entity.js';
import { PrintJobType } from './entities/print_job_type.entity.js';
import { Printer } from './entities/printer.entity.js';
import { PrinterCredential } from './entities/printer_credential.entity.js';
import { PrinterType } from './entities/printer_type.entity.js';
import { ReceiptPrintJob } from './entities/receipt_print_job.entity.js';

export const DATABASE_OPTIONS = {
  entities: [
    PrintJob,
    PrintJobType,
    Printer,
    PrinterCredential,
    PrinterType,
    ReceiptPrintJob,
  ],
  migrations: [BaseTables1720373216667],
};
