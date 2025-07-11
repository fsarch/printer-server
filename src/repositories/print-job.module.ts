import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrintJob } from '../database/entities/print_job.entity.js';
import { ReceiptPrintJob } from '../database/entities/receipt_print_job.entity.js';
import { Printer } from '../database/entities/printer.entity.js';
import { PrintJobService } from './print-job.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PrintJob, ReceiptPrintJob, Printer])],
  providers: [PrintJobService],
  exports: [PrintJobService],
})
export class PrintJobModule {}