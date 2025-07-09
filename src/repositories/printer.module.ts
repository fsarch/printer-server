import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Printer } from '../database/entities/printer.entity.js';
import { PrinterService } from './printer.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Printer])],
  providers: [PrinterService],
  exports: [PrinterService],
})
export class PrinterModule {}