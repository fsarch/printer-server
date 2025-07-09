import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { PrinterService } from './printer.service';
import { Printer } from '../database/entities/printer.entity';
import { CreatePrinterDto, PatchPrinterDto } from '../models/printer.dto';

describe('PrinterService', () => {
  let service: PrinterService;
  let repository: Repository<Printer>;

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
        PrinterService,
        {
          provide: getRepositoryToken(Printer),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PrinterService>(PrinterService);
    repository = module.get<Repository<Printer>>(getRepositoryToken(Printer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreatePrinter', () => {
    it('should create a new printer', async () => {
      const createPrinterDto: CreatePrinterDto = {
        printerTypeId: 'type-uuid',
        name: 'Test Printer',
        externalId: 'external-123',
      };

      const expectedPrinter = {
        id: 'printer-uuid',
        ...createPrinterDto,
        creationTime: new Date(),
        deletionTime: null,
      };

      mockRepository.create.mockReturnValue(expectedPrinter);
      mockRepository.save.mockResolvedValue(expectedPrinter);

      const result = await service.CreatePrinter(createPrinterDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createPrinterDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedPrinter);
      expect(result).toEqual(expectedPrinter);
    });
  });

  describe('GetById', () => {
    it('should return a printer when found', async () => {
      const printerId = 'printer-uuid';
      const expectedPrinter = {
        id: printerId,
        printerTypeId: 'type-uuid',
        name: 'Test Printer',
        externalId: 'external-123',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockRepository.findOne.mockResolvedValue(expectedPrinter);

      const result = await service.GetById(printerId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: printerId },
      });
      expect(result).toEqual(expectedPrinter);
    });

    it('should throw NotFoundException when printer not found', async () => {
      const printerId = 'non-existent-uuid';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.GetById(printerId)).rejects.toThrow(
        new NotFoundException(`Printer with ID ${printerId} not found`),
      );
    });
  });

  describe('ListPrinters', () => {
    it('should return a list of printers', async () => {
      const expectedPrinters = [
        {
          id: 'printer-1',
          printerTypeId: 'type-uuid',
          name: 'Printer 1',
          externalId: 'external-1',
          creationTime: new Date(),
          deletionTime: null,
        },
        {
          id: 'printer-2',
          printerTypeId: 'type-uuid',
          name: 'Printer 2',
          externalId: 'external-2',
          creationTime: new Date(),
          deletionTime: null,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedPrinters);

      const result = await service.ListPrinters();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { creationTime: 'DESC' },
      });
      expect(result).toEqual(expectedPrinters);
    });
  });

  describe('UpdatePrinter', () => {
    it('should update a printer', async () => {
      const printerId = 'printer-uuid';
      const patchPrinterDto: PatchPrinterDto = {
        name: 'Updated Printer Name',
      };

      const existingPrinter = {
        id: printerId,
        printerTypeId: 'type-uuid',
        name: 'Original Printer',
        externalId: 'external-123',
        creationTime: new Date(),
        deletionTime: null,
      };

      const updatedPrinter = {
        ...existingPrinter,
        name: 'Updated Printer Name',
      };

      // Mock GetById calls (called twice - once for existence check, once for return)
      mockRepository.findOne.mockResolvedValue(existingPrinter);
      mockRepository.findOne.mockResolvedValueOnce(existingPrinter);
      mockRepository.findOne.mockResolvedValueOnce(updatedPrinter);
      mockRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.UpdatePrinter(printerId, patchPrinterDto);

      expect(mockRepository.update).toHaveBeenCalledWith(printerId, patchPrinterDto);
      expect(result).toEqual(updatedPrinter);
    });

    it('should throw NotFoundException when printer to update not found', async () => {
      const printerId = 'non-existent-uuid';
      const patchPrinterDto: PatchPrinterDto = {
        name: 'Updated Name',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.UpdatePrinter(printerId, patchPrinterDto)).rejects.toThrow(
        new NotFoundException(`Printer with ID ${printerId} not found`),
      );
    });
  });

  describe('DeleteById', () => {
    it('should delete a printer', async () => {
      const printerId = 'printer-uuid';
      const existingPrinter = {
        id: printerId,
        printerTypeId: 'type-uuid',
        name: 'Test Printer',
        externalId: 'external-123',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockRepository.findOne.mockResolvedValue(existingPrinter);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });

      await service.DeleteById(printerId);

      expect(mockRepository.softDelete).toHaveBeenCalledWith(printerId);
    });

    it('should throw NotFoundException when printer to delete not found', async () => {
      const printerId = 'non-existent-uuid';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.DeleteById(printerId)).rejects.toThrow(
        new NotFoundException(`Printer with ID ${printerId} not found`),
      );
    });
  });
});