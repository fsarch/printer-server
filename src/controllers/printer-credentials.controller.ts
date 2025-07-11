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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { PrinterCredentialService } from '../repositories/printer-credential.service';
import {
  CreatePrinterCredentialDto,
  PatchPrinterCredentialDto,
  PrinterCredentialDto,
  PrinterCredentialWithTokenDto,
} from '../models/printer-credential.dto';
import { Roles } from '../fsarch/uac/decorators/roles.decorator';
import { Role } from '../fsarch/auth/role.enum';

@ApiTags('printer-credentials')
@ApiBearerAuth()
@Controller({ path: 'printers/:printerId/credentials', version: '1' })
export class PrinterCredentialsController {
  constructor(
    private readonly printerCredentialService: PrinterCredentialService,
  ) {}

  @Post()
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Create a new printer credential' })
  @ApiParam({
    name: 'printerId',
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 201,
    description: 'Printer credential created successfully',
    type: PrinterCredentialWithTokenDto,
  })
  async create(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Body() createPrinterCredentialDto: CreatePrinterCredentialDto,
  ): Promise<PrinterCredentialWithTokenDto> {
    const credential = await this.printerCredentialService.CreatePrinterCredential(
      printerId,
      createPrinterCredentialDto,
    );
    return PrinterCredentialWithTokenDto.FromDbo(credential);
  }

  @Get()
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Get all printer credentials' })
  @ApiParam({
    name: 'printerId',
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'List of printer credentials',
    type: [PrinterCredentialDto],
  })
  async findAll(
    @Param('printerId', ParseUUIDPipe) printerId: string,
  ): Promise<PrinterCredentialDto[]> {
    const credentials = await this.printerCredentialService.ListPrinterCredentials(
      printerId,
    );
    return credentials.map((credential) => PrinterCredentialDto.FromDbo(credential));
  }

  @Get(':id')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Get printer credential by ID' })
  @ApiParam({
    name: 'printerId',
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Printer credential found',
    type: PrinterCredentialDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Printer credential not found',
  })
  async findOne(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PrinterCredentialDto> {
    const credential = await this.printerCredentialService.GetById(id, printerId);
    return PrinterCredentialDto.FromDbo(credential);
  }

  @Patch(':id')
  @Roles(Role.manage_printers)
  @ApiOperation({ summary: 'Update printer credential by ID' })
  @ApiParam({
    name: 'printerId',
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Printer credential updated successfully',
    type: PrinterCredentialDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Printer credential not found',
  })
  async update(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() patchPrinterCredentialDto: PatchPrinterCredentialDto,
  ): Promise<PrinterCredentialDto> {
    const credential = await this.printerCredentialService.UpdatePrinterCredential(
      id,
      printerId,
      patchPrinterCredentialDto,
    );
    return PrinterCredentialDto.FromDbo(credential);
  }

  @Delete(':id')
  @Roles(Role.manage_printers)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete printer credential by ID' })
  @ApiParam({
    name: 'printerId',
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'id',
    description: 'Credential ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Printer credential deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Printer credential not found',
  })
  async remove(
    @Param('printerId', ParseUUIDPipe) printerId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<void> {
    await this.printerCredentialService.DeleteById(id, printerId);
  }
}