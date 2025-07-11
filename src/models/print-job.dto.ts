import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { PrintJob } from '../database/entities/print_job.entity.js';
import { ReceiptPrintJob } from '../database/entities/receipt_print_job.entity.js';

// Receipt data validation DTOs
export class AlignmentReceiptDataDto {
  @ApiProperty({
    description: 'Type discriminator',
    enum: ['alignment'],
  })
  @IsString()
  $type: 'alignment';

  @ApiProperty({
    description: 'Text alignment',
    enum: ['left', 'center', 'right'],
  })
  @IsEnum(['left', 'center', 'right'])
  alignment: 'left' | 'center' | 'right';

  @ApiProperty({
    description: 'Child elements',
    type: 'array',
    items: { type: 'object' },
  })
  @IsArray()
  children: any[];
}

export class TextFormatDto {
  @ApiProperty({
    description: 'Font type',
    enum: ['a', 'b', 'c'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['a', 'b', 'c'])
  font?: 'a' | 'b' | 'c';

  @ApiProperty({
    description: 'Bold formatting',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  bold?: boolean;

  @ApiProperty({
    description: 'Italic formatting',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  italic?: boolean;

  @ApiProperty({
    description: 'Underline formatting',
    required: false,
    oneOf: [
      { type: 'boolean' },
      { type: 'number', enum: [2] },
    ],
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === true || value === false || value === 2) {
      return value;
    }
    throw new Error('underline must be boolean or 2');
  })
  underline?: boolean | 2;
}

export class TextReceiptDataDto {
  @ApiProperty({
    description: 'Type discriminator',
    enum: ['text'],
  })
  @IsString()
  $type: 'text';

  @ApiProperty({
    description: 'Text value',
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Text formatting options',
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TextFormatDto)
  format?: TextFormatDto;
}

export class CutReceiptDataDto {
  @ApiProperty({
    description: 'Type discriminator',
    enum: ['cut'],
  })
  @IsString()
  $type: 'cut';
}

export class NewlineReceiptDataDto {
  @ApiProperty({
    description: 'Type discriminator',
    enum: ['newline'],
  })
  @IsString()
  $type: 'newline';
}

// Union type for receipt data (handled at validation level)
export type ReceiptDataDto =
  | AlignmentReceiptDataDto
  | TextReceiptDataDto
  | CutReceiptDataDto
  | NewlineReceiptDataDto;

export class CreatePrintJobDto {
  @ApiProperty({
    description: 'External ID for the print job',
    maxLength: 256,
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiProperty({
    description: 'Print job data - for receipt printers, must match receipt data schema',
    oneOf: [
      { $ref: '#/components/schemas/AlignmentReceiptDataDto' },
      { $ref: '#/components/schemas/TextReceiptDataDto' },
      { $ref: '#/components/schemas/CutReceiptDataDto' },
      { $ref: '#/components/schemas/NewlineReceiptDataDto' },
    ],
  })
  data: ReceiptDataDto | any;
}

export class PrintJobDto {
  @ApiProperty({
    description: 'Print job ID',
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Printer ID',
    type: 'string',
    format: 'uuid',
  })
  printerId: string;

  @ApiProperty({
    description: 'Print job type ID',
    type: 'string',
    format: 'uuid',
  })
  printJobTypeId: string;

  @ApiProperty({
    description: 'External ID for the print job',
    nullable: true,
  })
  externalId: string | null;

  @ApiProperty({
    description: 'Collection printer credential ID',
    nullable: true,
    type: 'string',
    format: 'uuid',
  })
  collectionPrinterCredentialId: string | null;

  @ApiProperty({
    description: 'Collection time',
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  collectionTime: string | null;

  @ApiProperty({
    description: 'Print time',
    nullable: true,
    type: 'string',
    format: 'date-time',
  })
  printTime: string | null;

  @ApiProperty({
    description: 'Creation time',
    type: 'string',
    format: 'date-time',
  })
  creationTime: Date;

  @ApiProperty({
    description: 'Receipt data (only present for receipt print jobs)',
    nullable: true,
  })
  data?: any;

  static FromDbo(printJob: PrintJob, receiptData?: ReceiptPrintJob): PrintJobDto {
    return {
      id: printJob.id,
      printerId: printJob.printerId,
      printJobTypeId: printJob.printJobTypeId,
      externalId: printJob.externalId || null,
      collectionPrinterCredentialId: printJob.collectionPrinterCredentialId,
      collectionTime: printJob.collectionTime,
      printTime: printJob.printTime,
      creationTime: printJob.creationTime,
      data: receiptData?.data,
    };
  }
}
