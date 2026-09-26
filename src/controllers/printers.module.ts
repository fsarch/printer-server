import { Module } from '@nestjs/common';
import { PrinterModule } from '../repositories/printer.module.js';
import { PrinterCredentialModule } from '../repositories/printer-credential.module.js';
import { PrinterCredentialsController } from './printer-credentials.controller.js';
import { PrintersController } from './printers.controller.js';

@Module({
  imports: [PrinterModule, PrinterCredentialModule],
  controllers: [PrintersController, PrinterCredentialsController],
})
export class PrintersModule {}
