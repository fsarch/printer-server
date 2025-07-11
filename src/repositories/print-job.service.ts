import { Injectable, NotFoundException, NotImplementedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrintJob } from '../database/entities/print_job.entity.js';
import { ReceiptPrintJob } from '../database/entities/receipt_print_job.entity.js';
import { Printer } from '../database/entities/printer.entity.js';
import { PrinterType } from '../database/entities/printer_type.entity.js';
import { CreatePrintJobDto, PrintJobDto, ReceiptDataDto } from '../models/print-job.dto.js';
import { PrinterType as PrinterTypeEnum } from '../constants/printer-type.enum.js';
import { PrintJobType as PrintJobTypeEnum } from '../constants/print-job-type.enum.js';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { 
  AlignmentReceiptDataDto, 
  TextReceiptDataDto, 
  CutReceiptDataDto, 
  NewlineReceiptDataDto 
} from '../models/print-job.dto.js';

@Injectable()
export class PrintJobService {
  constructor(
    @InjectRepository(PrintJob)
    private readonly printJobRepository: Repository<PrintJob>,
    @InjectRepository(ReceiptPrintJob)
    private readonly receiptPrintJobRepository: Repository<ReceiptPrintJob>,
    @InjectRepository(Printer)
    private readonly printerRepository: Repository<Printer>,
  ) {}

  async createPrintJob(printerId: string, createPrintJobDto: CreatePrintJobDto): Promise<PrintJobDto> {
    // Get printer and check if it exists
    const printer = await this.printerRepository.findOne({
      where: { id: printerId },
    });

    if (!printer) {
      throw new NotFoundException(`Printer with ID ${printerId} not found`);
    }

    // Check printer type - only receipt printers are supported
    if (printer.printerTypeId !== PrinterTypeEnum.RECEIPT) {
      throw new NotImplementedException('Print jobs are only supported for receipt printers');
    }

    // Validate receipt data
    await this.validateReceiptData(createPrintJobDto.data);

    // Create print job
    const printJob = this.printJobRepository.create({
      id: crypto.randomUUID(),
      printerId: printerId,
      printJobTypeId: PrintJobTypeEnum.RECEIPT,
      externalId: createPrintJobDto.externalId,
      collectionPrinterCredentialId: null,
      collectionTime: null,
      printTime: null,
    });

    const savedPrintJob = await this.printJobRepository.save(printJob);

    // Create receipt print job
    const receiptPrintJob = this.receiptPrintJobRepository.create({
      id: savedPrintJob.id,
      data: createPrintJobDto.data,
    });

    const savedReceiptPrintJob = await this.receiptPrintJobRepository.save(receiptPrintJob);

    return PrintJobDto.FromDbo(savedPrintJob, savedReceiptPrintJob);
  }

  async listPrintJobs(printerId: string): Promise<PrintJobDto[]> {
    // Check if printer exists
    const printer = await this.printerRepository.findOne({
      where: { id: printerId },
    });

    if (!printer) {
      throw new NotFoundException(`Printer with ID ${printerId} not found`);
    }

    // Get print jobs for the printer
    const printJobs = await this.printJobRepository.find({
      where: { printerId },
      order: { creationTime: 'DESC' },
    });

    const result: PrintJobDto[] = [];

    for (const printJob of printJobs) {
      let receiptData: ReceiptPrintJob | undefined;

      // If it's a receipt job, get the receipt data
      if (printJob.printJobTypeId === PrintJobTypeEnum.RECEIPT) {
        receiptData = await this.receiptPrintJobRepository.findOne({
          where: { id: printJob.id },
        });
      }

      result.push(PrintJobDto.FromDbo(printJob, receiptData));
    }

    return result;
  }

  private async validateReceiptData(data: any): Promise<void> {
    if (!data || typeof data !== 'object') {
      throw new BadRequestException('Data must be an object');
    }

    if (!data.$type) {
      throw new BadRequestException('Data must have a $type field');
    }

    let dtoClass: any;
    switch (data.$type) {
      case 'alignment':
        dtoClass = AlignmentReceiptDataDto;
        break;
      case 'text':
        dtoClass = TextReceiptDataDto;
        break;
      case 'cut':
        dtoClass = CutReceiptDataDto;
        break;
      case 'newline':
        dtoClass = NewlineReceiptDataDto;
        break;
      default:
        throw new BadRequestException(`Invalid $type: ${data.$type}. Must be one of: alignment, text, cut, newline`);
    }

    const dto = plainToClass(dtoClass, data);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const errorMessages = errors.map(error => 
        Object.values(error.constraints || {}).join(', ')
      ).join('; ');
      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }

    // For alignment type, recursively validate children
    if (data.$type === 'alignment' && data.children) {
      if (!Array.isArray(data.children)) {
        throw new BadRequestException('Alignment children must be an array');
      }
      
      for (const child of data.children) {
        await this.validateReceiptData(child);
      }
    }
  }
}