import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';
import { Printer } from '../database/entities/printer.entity.js';

export class CreatePrinterDto {
  @ApiProperty({
    description: 'Printer type ID',
    type: 'string',
    format: 'uuid',
  })
  @IsUUID()
  printerTypeId: string;

  @ApiProperty({
    description: 'Printer name',
    maxLength: 512,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'External ID for the printer',
    maxLength: 256,
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;
}

export class PatchPrinterDto {
  @ApiProperty({
    description: 'Printer type ID',
    type: 'string',
    format: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  printerTypeId?: string;

  @ApiProperty({
    description: 'Printer name',
    maxLength: 512,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'External ID for the printer',
    maxLength: 256,
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;
}

export class PrinterDto {
  @ApiProperty({
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Printer type ID',
    type: 'string',
    format: 'uuid',
  })
  printerTypeId: string;

  @ApiProperty({
    description: 'Printer name',
  })
  name: string;

  @ApiProperty({
    description: 'External ID for the printer',
    nullable: true,
  })
  externalId: string | null;

  @ApiProperty({
    description: 'Creation time',
    type: 'string',
    format: 'date-time',
  })
  creationTime: Date;

  @ApiProperty({
    description: 'Deletion time',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  deletionTime: Date | null;

  static FromDbo(printer: Printer): PrinterDto {
    return {
      id: printer.id,
      printerTypeId: printer.printerTypeId,
      name: printer.name,
      externalId: printer.externalId || null,
      creationTime: printer.creationTime,
      deletionTime: printer.deletionTime || null,
    };
  }
}