import { Module } from '@nestjs/common';
import { PrintJobsController } from './print-jobs.controller.js';
import { PrintJobModule } from '../repositories/print-job.module.js';
import { UacModule } from '../fsarch/uac/uac.module.js';

@Module({
  imports: [
    PrintJobModule,
    UacModule.register({ roles: ['manage_printers'] })
  ],
  controllers: [PrintJobsController],
})
export class PrintJobsModule {}