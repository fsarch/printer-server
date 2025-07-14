import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { PrinterCredential } from '../database/entities/printer_credential.entity.js';

export class CreatePrinterCredentialDto {
  @ApiProperty({
    description: 'Credential name',
    maxLength: 512,
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'External ID for the credential',
    maxLength: 256,
    required: false,
  })
  @IsOptional()
  @IsString()
  externalId?: string;
}

export class PatchPrinterCredentialDto {
  @ApiProperty({
    description: 'Credential name',
    maxLength: 512,
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class PrinterCredentialDto {
  @ApiProperty({
    description: 'Credential ID',
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
    description: 'Credential name',
  })
  name: string;

  @ApiProperty({
    description: 'External ID for the credential',
    nullable: true,
  })
  externalId: string | null;

  @ApiProperty({
    description: 'Creation time',
    type: 'string',
    format: 'date-time',
  })
  creationTime: Date;

  static FromDbo(credential: PrinterCredential): PrinterCredentialDto {
    return {
      id: credential.id,
      printerId: credential.printerId,
      name: credential.name,
      externalId: credential.externalId || null,
      creationTime: credential.creationTime,
    };
  }
}

export class PrinterCredentialWithTokenDto extends PrinterCredentialDto {
  @ApiProperty({
    description: 'Generated token for the credential',
    maxLength: 256,
  })
  token: string;

  static FromDbo(credential: PrinterCredential): PrinterCredentialWithTokenDto {
    return {
      id: credential.id,
      printerId: credential.printerId,
      name: credential.name,
      externalId: credential.externalId || null,
      creationTime: credential.creationTime,
      token: credential.token,
    };
  }
}
