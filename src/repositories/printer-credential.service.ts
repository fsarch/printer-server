import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrinterCredential } from '../database/entities/printer_credential.entity.js';
import {
  CreatePrinterCredentialDto,
  PatchPrinterCredentialDto
} from '../models/printer-credential.dto.js';
import { randomBytes } from 'crypto';

@Injectable()
export class PrinterCredentialService {
  constructor(
    @InjectRepository(PrinterCredential)
    private readonly printerCredentialRepository: Repository<PrinterCredential>,
  ) {}

  /**
   * Generate a secure token for the printer credential
   * Uses cryptographic randomBytes and encodes as base64url (URL-safe)
   * Returns a token no longer than 256 characters
   */
  private generateSecureToken(): string {
    // Generate 32 bytes (256 bits) of random data
    // Base64url encoding results in ~43 characters, well under 256 limit
    const randomBytesData = randomBytes(32);
    return randomBytesData.toString('base64url');
  }

  async CreatePrinterCredential(
    printerId: string,
    createPrinterCredentialDto: CreatePrinterCredentialDto,
  ): Promise<PrinterCredential> {
    const credential = this.printerCredentialRepository.create({
      id: crypto.randomUUID(),
      printerId,
      token: this.generateSecureToken(),
      ...createPrinterCredentialDto,
    });
    return await this.printerCredentialRepository.save(credential);
  }

  async GetById(id: string, printerId: string): Promise<PrinterCredential> {
    const credential = await this.printerCredentialRepository.findOne({
      where: { id, printerId },
    });

    if (!credential) {
      throw new NotFoundException(`Printer credential with ID ${id} not found`);
    }

    return credential;
  }

  async ListPrinterCredentials(printerId: string): Promise<PrinterCredential[]> {
    return await this.printerCredentialRepository.find({
      where: { printerId },
      order: { creationTime: 'DESC' },
    });
  }

  async UpdatePrinterCredential(
    id: string,
    printerId: string,
    patchPrinterCredentialDto: PatchPrinterCredentialDto,
  ): Promise<PrinterCredential> {
    // Check if credential exists for this printer
    await this.GetById(id, printerId);

    await this.printerCredentialRepository.update(
      { id, printerId },
      patchPrinterCredentialDto,
    );
    return await this.GetById(id, printerId);
  }

  async DeleteById(id: string, printerId: string): Promise<void> {
    // Check if credential exists for this printer
    await this.GetById(id, printerId);

    await this.printerCredentialRepository.softDelete({ id, printerId });
  }
}
