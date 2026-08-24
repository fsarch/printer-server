import { Module } from '@nestjs/common';
import { PrintersController } from './printers.controller.js';
import { PrinterCredentialsController } from './printer-credentials.controller.js';
import { PrinterModule } from '../repositories/printer.module.js';
import { PrinterCredentialModule } from '../repositories/printer-credential.module.js';

@Module({
  imports: [PrinterModule, PrinterCredentialModule],
  controllers: [PrintersController, PrinterCredentialsController],
})
export class PrintersModule {}
