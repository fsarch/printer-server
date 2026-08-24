import { Module } from '@nestjs/common';
import { PrintersModule } from './controllers/printers.module.js';
import { PrintJobsModule } from './controllers/print-jobs.module.js';

@Module({
  imports: [PrintersModule, PrintJobsModule],
})
export class AppModule {}
