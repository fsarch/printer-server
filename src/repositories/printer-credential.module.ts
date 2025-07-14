import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterCredential } from '../database/entities/printer_credential.entity.js';
import { PrinterCredentialService } from './printer-credential.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PrinterCredential])],
  providers: [PrinterCredentialService],
  exports: [PrinterCredentialService],
})
export class PrinterCredentialModule {}
