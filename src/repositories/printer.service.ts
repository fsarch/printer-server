import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Printer } from '../database/entities/printer.entity.js';
import { CreatePrinterDto, PatchPrinterDto } from '../models/printer.dto.js';

@Injectable()
export class PrinterService {
  constructor(
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
  ) {}

  async CreatePrinter(createPrinterDto: CreatePrinterDto): Promise<Printer> {
    const printer = this.printerRepository.create(createPrinterDto);
    return await this.printerRepository.save(printer);
  }

  async GetById(id: string): Promise<Printer> {
    const printer = await this.printerRepository.findOne({
      where: { id },
    });

    if (!printer) {
      throw new NotFoundException(`Printer with ID ${id} not found`);
    }

    return printer;
  }

  async ListPrinters(): Promise<Printer[]> {
    return await this.printerRepository.find({
      order: { creationTime: 'DESC' },
    });
  }

  async UpdatePrinter(
    id: string,
    patchPrinterDto: PatchPrinterDto,
  ): Promise<Printer> {
    // Check if printer exists
    await this.GetById(id);

    await this.printerRepository.update(id, patchPrinterDto);
    return await this.GetById(id);
  }

  async DeleteById(id: string): Promise<void> {
    // Check if printer exists
    await this.GetById(id);

    await this.printerRepository.softDelete(id);
  }
}
