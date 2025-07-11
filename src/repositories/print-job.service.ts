import { Injectable, NotFoundException, NotImplementedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrintJob } from '../database/entities/print_job.entity.js';
import { ReceiptPrintJob } from '../database/entities/receipt_print_job.entity.js';
import { Printer } from '../database/entities/printer.entity.js';
import { PrinterType } from '../database/entities/printer_type.entity.js';
import { 
  CreatePrintJobDto, 
  PrintJobDto, 
  ReceiptDataDto, 
  UpdatePrintJobDto,
  AlignmentReceiptDataDto,
  TextReceiptDataDto,
  CutReceiptDataDto,
  NewlineReceiptDataDto
} from '../models/print-job.dto.js';
import { PrinterType as PrinterTypeEnum } from '../constants/printer-type.enum.js';
import { PrintJobType as PrintJobTypeEnum } from '../constants/print-job-type.enum.js';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

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
    await Promise.all(createPrintJobDto.data.map(async (d) => await this.validateReceiptData(d)));

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

  async updatePrintJob(printerId: string, jobId: string, updatePrintJobDto: UpdatePrintJobDto): Promise<PrintJobDto> {
    // Check if printer exists
    const printer = await this.printerRepository.findOne({
      where: { id: printerId },
    });

    if (!printer) {
      throw new NotFoundException(`Printer with ID ${printerId} not found`);
    }

    // Get the print job and verify it belongs to the printer
    const printJob = await this.printJobRepository.findOne({
      where: { id: jobId, printerId },
    });

    if (!printJob) {
      throw new NotFoundException(`Print job with ID ${jobId} not found for printer ${printerId}`);
    }

    // Update only the provided fields
    const updateData: Partial<PrintJob> = {};
    
    if (updatePrintJobDto.collectionTime !== undefined) {
      updateData.collectionTime = updatePrintJobDto.collectionTime;
    }
    
    if (updatePrintJobDto.printTime !== undefined) {
      updateData.printTime = updatePrintJobDto.printTime;
    }

    // If no fields to update, return current job
    if (Object.keys(updateData).length === 0) {
      // Get receipt data if it's a receipt job
      let receiptData: ReceiptPrintJob | undefined;
      if (printJob.printJobTypeId === PrintJobTypeEnum.RECEIPT) {
        receiptData = await this.receiptPrintJobRepository.findOne({
          where: { id: printJob.id },
        });
      }
      return PrintJobDto.FromDbo(printJob, receiptData);
    }

    // Update the print job
    await this.printJobRepository.update(jobId, updateData);

    // Get the updated print job
    const updatedPrintJob = await this.printJobRepository.findOne({
      where: { id: jobId },
    });

    // Get receipt data if it's a receipt job
    let receiptData: ReceiptPrintJob | undefined;
    if (updatedPrintJob && updatedPrintJob.printJobTypeId === PrintJobTypeEnum.RECEIPT) {
      receiptData = await this.receiptPrintJobRepository.findOne({
        where: { id: updatedPrintJob.id },
      });
    }

    return PrintJobDto.FromDbo(updatedPrintJob!, receiptData);
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
