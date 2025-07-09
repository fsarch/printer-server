import { Module } from '@nestjs/common';
import { PrintersController } from './printers.controller.js';
import { PrinterModule } from '../repositories/printer.module.js';

@Module({
  imports: [PrinterModule],
  controllers: [PrintersController],
})
export class PrintersModule {}