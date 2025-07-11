import { Module } from '@nestjs/common';
import { PrintersController } from './printers.controller.js';
import { PrinterCredentialsController } from './printer-credentials.controller';
import { PrinterModule } from '../repositories/printer.module.js';
import { PrintJobModule } from '../repositories/print-job.module.js';
import { PrinterCredentialModule } from '../repositories/printer-credential.module';
import { UacModule } from '../fsarch/uac/uac.module.js';

@Module({
  imports: [
    PrinterModule, 
    PrintJobModule,
    PrinterCredentialModule, 
    UacModule.register({ roles: ['manage_printers'] })
  ],
  controllers: [PrintersController, PrinterCredentialsController],
})
export class PrintersModule {}
