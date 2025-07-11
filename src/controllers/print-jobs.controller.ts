import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { PrintJobService } from '../repositories/print-job.service.js';
import {
  CreatePrintJobDto,
  PrintJobDto,
  UpdatePrintJobDto,
} from '../models/print-job.dto.js';
import { Roles } from '../fsarch/uac/decorators/roles.decorator.js';
import { Role } from '../fsarch/auth/role.enum.js';

@ApiTags('print-jobs')
@ApiBearerAuth()
@Controller({ path: 'printers/:printerId/jobs', version: '1' })
export class PrintJobsController {
  constructor(
    private readonly printJobService: PrintJobService,
  ) {}

  @Post()
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

  @Get()
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'List print jobs for the printer' })
  @ApiQuery({
    name: 'printTime',
    required: false,
    type: 'string',
    description: 'Filter by print time status. Use "null" to get jobs without print time. Omit to get all jobs.',
    example: 'null',
  })
  @ApiResponse({
    status: 200,
    description: 'List of print jobs for the printer',
    type: [PrintJobDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid printTime parameter',
  })
  @ApiResponse({
    status: 404,
    description: 'Printer not found',
  })
  async listPrintJobs(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Query('printTime') printTime?: string,
  ): Promise<PrintJobDto[]> {
    return await this.printJobService.listPrintJobs(printerId, printTime);
  }

  @Patch(':jobId')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Update collection time and print time for a print job' })
  @ApiResponse({
    status: 200,
    description: 'Print job updated successfully',
    type: PrintJobDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Printer or print job not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid timestamp format',
  })
  async updatePrintJob(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @Body() updatePrintJobDto: UpdatePrintJobDto,
  ): Promise<PrintJobDto> {
    return await this.printJobService.updatePrintJob(printerId, jobId, updatePrintJobDto);
  }
}