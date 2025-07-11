import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PrinterCredentialService } from './printer-credential.service';
import { PrinterCredential } from '../database/entities/printer_credential.entity';
import { CreatePrinterCredentialDto, PatchPrinterCredentialDto } from '../models/printer-credential.dto';

describe('PrinterCredentialService', () => {
  let service: PrinterCredentialService;
  let repository: Repository<PrinterCredential>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrinterCredentialService,
        {
          provide: getRepositoryToken(PrinterCredential),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PrinterCredentialService>(PrinterCredentialService);
    repository = module.get<Repository<PrinterCredential>>(getRepositoryToken(PrinterCredential));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreatePrinterCredential', () => {
    it('should create a new printer credential with secure token', async () => {
      const printerId = 'printer-uuid';
      const createDto: CreatePrinterCredentialDto = {
        name: 'Test Credential',
        externalId: 'external-123',
      };

      const mockCredential = {
        id: 'credential-uuid',
        printerId,
        ...createDto,
        token: 'generated-token',
        creationTime: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCredential);
      mockRepository.save.mockResolvedValue(mockCredential);

      const result = await service.CreatePrinterCredential(printerId, createDto);

      expect(mockRepository.create).toHaveBeenCalledWith({
        id: expect.any(String), // UUID
        printerId,
        token: expect.any(String), // Generated token
        ...createDto,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockCredential);
      expect(result).toBe(mockCredential);
      
      // Verify the generated token is within length limits
      const createCall = mockRepository.create.mock.calls[0][0];
      expect(createCall.token).toBeDefined();
      expect(createCall.token.length).toBeLessThanOrEqual(256);
    });
  });

  describe('GetById', () => {
    it('should return a printer credential when found', async () => {
      const credentialId = 'credential-uuid';
      const printerId = 'printer-uuid';
      const mockCredential = {
        id: credentialId,
        printerId,
        name: 'Test Credential',
        token: 'token',
        creationTime: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCredential);

      const result = await service.GetById(credentialId, printerId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: credentialId, printerId },
      });
      expect(result).toBe(mockCredential);
    });

    it('should throw NotFoundException when credential not found', async () => {
      const credentialId = 'credential-uuid';
      const printerId = 'printer-uuid';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.GetById(credentialId, printerId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: credentialId, printerId },
      });
    });
  });

  describe('ListPrinterCredentials', () => {
    it('should return list of printer credentials ordered by creation time', async () => {
      const printerId = 'printer-uuid';
      const mockCredentials = [
        {
          id: 'credential-1',
          printerId,
          name: 'Credential 1',
          token: 'token-1',
          creationTime: new Date(),
        },
        {
          id: 'credential-2',
          printerId,
          name: 'Credential 2',
          token: 'token-2',
          creationTime: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockCredentials);

      const result = await service.ListPrinterCredentials(printerId);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { printerId },
        order: { creationTime: 'DESC' },
      });
      expect(result).toBe(mockCredentials);
    });
  });

  describe('UpdatePrinterCredential', () => {
    it('should update a printer credential', async () => {
      const credentialId = 'credential-uuid';
      const printerId = 'printer-uuid';
      const patchDto: PatchPrinterCredentialDto = {
        name: 'Updated Name',
      };

      const existingCredential = {
        id: credentialId,
        printerId,
        name: 'Original Name',
        token: 'token',
        creationTime: new Date(),
      };

      const updatedCredential = {
        ...existingCredential,
        name: 'Updated Name',
      };

      // Mock GetById calls
      mockRepository.findOne
        .mockResolvedValueOnce(existingCredential) // First call for checking existence
        .mockResolvedValueOnce(updatedCredential); // Second call for returning updated result

      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.UpdatePrinterCredential(credentialId, printerId, patchDto);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(2);
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: credentialId, printerId },
        patchDto,
      );
      expect(result).toBe(updatedCredential);
    });

    it('should throw NotFoundException when updating non-existent credential', async () => {
      const credentialId = 'credential-uuid';
      const printerId = 'printer-uuid';
      const patchDto: PatchPrinterCredentialDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.UpdatePrinterCredential(credentialId, printerId, patchDto),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('DeleteById', () => {
    it('should delete a printer credential', async () => {
      const credentialId = 'credential-uuid';
      const printerId = 'printer-uuid';

      const existingCredential = {
        id: credentialId,
        printerId,
        name: 'Test Credential',
        token: 'token',
        creationTime: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingCredential);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.DeleteById(credentialId, printerId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: credentialId, printerId },
      });
      expect(mockRepository.softDelete).toHaveBeenCalledWith({ id: credentialId, printerId });
    });

    it('should throw NotFoundException when deleting non-existent credential', async () => {
      const credentialId = 'credential-uuid';
      const printerId = 'printer-uuid';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.DeleteById(credentialId, printerId)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});