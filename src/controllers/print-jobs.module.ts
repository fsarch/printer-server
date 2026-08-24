import { Module } from '@nestjs/common';
import { PrintJobsController } from './print-jobs.controller.js';
import { PrintJobModule } from '../repositories/print-job.module.js';

@Module({
  imports: [PrintJobModule],
  controllers: [PrintJobsController],
})
export class PrintJobsModule {}