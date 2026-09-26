import { Module } from '@nestjs/common';
import { PrintJobsModule } from './controllers/print-jobs.module.js';
import { PrintersModule } from './controllers/printers.module.js';

@Module({
  imports: [PrintersModule, PrintJobsModule],
})
export class AppModule {}
