import { Module } from '@nestjs/common';
import { PrintersController } from './printers.controller.js';
import { PrinterModule } from '../repositories/printer.module.js';
import { UacModule } from '../fsarch/uac/uac.module.js';

@Module({
  imports: [PrinterModule, UacModule.register({ roles: ['manage_printers'] })],
  controllers: [PrintersController],
})
export class PrintersModule {}
