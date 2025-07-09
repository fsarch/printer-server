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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrinterService } from '../repositories/printer.service.js';
import { CreatePrinterDto, PatchPrinterDto, PrinterDto } from '../models/printer.dto.js';

@ApiTags('printers')
@ApiBearerAuth()
@Controller('printers')
export class PrintersController {
  constructor(private readonly printerService: PrinterService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new printer' })
  @ApiResponse({
    status: 201,
    description: 'Printer created successfully',
    type: PrinterDto,
  })
  async create(@Body() createPrinterDto: CreatePrinterDto): Promise<PrinterDto> {
    const printer = await this.printerService.CreatePrinter(createPrinterDto);
    return PrinterDto.FromDbo(printer);
  }

  @Get()
  @ApiOperation({ summary: 'Get all printers' })
  @ApiResponse({
    status: 200,
    description: 'List of printers',
    type: [PrinterDto],
  })
  async findAll(): Promise<PrinterDto[]> {
    const printers = await this.printerService.ListPrinters();
    return printers.map(printer => PrinterDto.FromDbo(printer));
  }

  @Get(':id')
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
    const printer = await this.printerService.UpdatePrinter(id, patchPrinterDto);
    return PrinterDto.FromDbo(printer);
  }

  @Delete(':id')
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
}