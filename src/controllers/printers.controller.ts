import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { PrinterService } from '../repositories/printer.service.js';
import {
  CreatePrinterDto,
  PatchPrinterDto,
  PrinterDto,
} from '../models/printer.dto.js';
import { PrintJobService } from '../repositories/print-job.service.js';
import {
  CreatePrintJobDto,
  PrintJobDto,
} from '../models/print-job.dto.js';
import { Roles } from '../fsarch/uac/decorators/roles.decorator.js';
import { Role } from '../fsarch/auth/role.enum.js';

@ApiTags('printers')
@ApiBearerAuth()
@Controller({ path: 'printers', version: '1' })
export class PrintersController {
  constructor(
    private readonly printerService: PrinterService,
    private readonly printJobService: PrintJobService,
  ) {}

  @Post()
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Create a new printer' })
  @ApiResponse({
    status: 201,
    description: 'Printer created successfully',
    type: PrinterDto,
  })
  async create(
    @Body() createPrinterDto: CreatePrinterDto,
  ): Promise<PrinterDto> {
    const printer = await this.printerService.CreatePrinter(createPrinterDto);
    return PrinterDto.FromDbo(printer);
  }

  @Get()
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Get all printers' })
  @ApiResponse({
    status: 200,
    description: 'List of printers',
    type: [PrinterDto],
  })
  async findAll(): Promise<PrinterDto[]> {
    const printers = await this.printerService.ListPrinters();
    return printers.map((printer) => PrinterDto.FromDbo(printer));
  }

  @Get(':id')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Get printer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Printer found',
    type: PrinterDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Printer not found',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<PrinterDto> {
    const printer = await this.printerService.GetById(id);
    return PrinterDto.FromDbo(printer);
  }

  @Patch(':id')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Update printer by ID' })
  @ApiResponse({
    status: 200,
    description: 'Printer updated successfully',
    type: PrinterDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Printer not found',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() patchPrinterDto: PatchPrinterDto,
  ): Promise<PrinterDto> {
    const printer = await this.printerService.UpdatePrinter(
      id,
      patchPrinterDto,
    );
    return PrinterDto.FromDbo(printer);
  }

  @Delete(':id')
  @Roles(Role.manage_printers)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete printer by ID' })
  @ApiResponse({
    status: 204,
    description: 'Printer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Printer not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.printerService.DeleteById(id);
  }

  @Post(':printerId/jobs')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Create a new print job for the printer' })
  @ApiResponse({
    status: 201,
    description: 'Print job created successfully',
    type: PrintJobDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Printer not found',
  })
  @ApiResponse({
    status: 501,
    description: 'Not implemented for non-receipt printers',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid receipt data',
  })
  async createPrintJob(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Body() createPrintJobDto: CreatePrintJobDto,
  ): Promise<PrintJobDto> {
    return await this.printJobService.createPrintJob(printerId, createPrintJobDto);
  }

  @Get(':printerId/jobs')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'List print jobs for the printer' })
  @ApiResponse({
    status: 200,
    description: 'List of print jobs for the printer',
    type: [PrintJobDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Printer not found',
  })
  async listPrintJobs(
    @Param('printerId', ParseUUIDPipe) printerId: string,
  ): Promise<PrintJobDto[]> {
    return await this.printJobService.listPrintJobs(printerId);
  }
}
