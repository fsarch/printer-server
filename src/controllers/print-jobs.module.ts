import { Module } from '@nestjs/common';
import { PrintJobModule } from '../repositories/print-job.module.js';
import { PrintJobsController } from './print-jobs.controller.js';

@Module({
  imports: [PrintJobModule],
  controllers: [PrintJobsController],
})
export class PrintJobsModule {}
