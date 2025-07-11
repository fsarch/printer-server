import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrinterCredential } from '../database/entities/printer_credential.entity';
import { PrinterCredentialService } from './printer-credential.service';

@Module({
  imports: [TypeOrmModule.forFeature([PrinterCredential])],
  providers: [PrinterCredentialService],
  exports: [PrinterCredentialService],
})
export class PrinterCredentialModule {}