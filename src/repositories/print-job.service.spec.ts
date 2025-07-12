import { Test, TestingModule } from '@nestjs/testing';
import { PrintJobService } from './print-job.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PrintJob } from '../database/entities/print_job.entity';
import { ReceiptPrintJob } from '../database/entities/receipt_print_job.entity';
import { Printer } from '../database/entities/printer.entity';
import { PrinterType } from '../constants/printer-type.enum';
import { PrintJobType } from '../constants/print-job-type.enum';
import { NotFoundException, NotImplementedException, BadRequestException } from '@nestjs/common';

describe('PrintJobService', () => {
  let service: PrintJobService;
  let printJobRepository: Repository<PrintJob>;
  let receiptPrintJobRepository: Repository<ReceiptPrintJob>;
  let printerRepository: Repository<Printer>;

  const mockPrintJobRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockReceiptPrintJobRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPrinterRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrintJobService,
        {
          provide: getRepositoryToken(PrintJob),
          useValue: mockPrintJobRepository,
        },
        {
          provide: getRepositoryToken(ReceiptPrintJob),
          useValue: mockReceiptPrintJobRepository,
        },
        {
          provide: getRepositoryToken(Printer),
          useValue: mockPrinterRepository,
        },
      ],
    }).compile();

    service = module.get<PrintJobService>(PrintJobService);
    printJobRepository = module.get<Repository<PrintJob>>(getRepositoryToken(PrintJob));
    receiptPrintJobRepository = module.get<Repository<ReceiptPrintJob>>(getRepositoryToken(ReceiptPrintJob));
    printerRepository = module.get<Repository<Printer>>(getRepositoryToken(Printer));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPrintJob', () => {
    it('should throw NotFoundException when printer does not exist', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createPrintJob('non-existent-printer-id', {
          data: { $type: 'text', value: 'Hello' },
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotImplementedException for non-receipt printers', async () => {
      mockPrinterRepository.findOne.mockResolvedValue({
        id: 'printer-id',
        printerTypeId: 'some-other-type',
      });

      await expect(
        service.createPrintJob('printer-id', {
          data: { $type: 'text', value: 'Hello' },
        }),
      ).rejects.toThrow(NotImplementedException);
    });

    it('should create print job for receipt printer with valid text data', async () => {
      const printerId = 'printer-id';
      const mockPrinter = {
        id: printerId,
        printerTypeId: PrinterType.RECEIPT,
      };
      const mockPrintJob = {
        id: 'job-id',
        printerId,
        printJobTypeId: PrintJobType.RECEIPT,
        externalId: null,
        collectionPrinterCredentialId: null,
        collectionTime: null,
        printTime: null,
        creationTime: new Date(),
      };
      const mockReceiptPrintJob = {
        id: 'job-id',
        data: { $type: 'text', value: 'Hello' },
      };

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.create.mockReturnValue(mockPrintJob);
      mockPrintJobRepository.save.mockResolvedValue(mockPrintJob);
      mockReceiptPrintJobRepository.create.mockReturnValue(mockReceiptPrintJob);
      mockReceiptPrintJobRepository.save.mockResolvedValue(mockReceiptPrintJob);

      const result = await service.createPrintJob(printerId, {
        data: { $type: 'text', value: 'Hello' },
      });

      expect(result).toBeDefined();
      expect(result.printerId).toBe(printerId);
      expect(result.data).toEqual({ $type: 'text', value: 'Hello' });
    });
  });

  describe('listPrintJobs', () => {
    it('should throw NotFoundException when printer does not exist', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(null);

      await expect(
        service.listPrintJobs('non-existent-printer-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return list of print jobs for existing printer', async () => {
      const printerId = 'printer-id';
      const mockPrinter = { id: printerId };
      const mockPrintJobs = [
        {
          id: 'job-1',
          printerId,
          printJobTypeId: PrintJobType.RECEIPT,
          creationTime: new Date(),
        },
      ];

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.find.mockResolvedValue(mockPrintJobs);
      mockReceiptPrintJobRepository.findOne.mockResolvedValue({
        id: 'job-1',
        data: { $type: 'text', value: 'Test' },
      });

      const result = await service.listPrintJobs(printerId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job-1');
      expect(result[0].data).toEqual({ $type: 'text', value: 'Test' });
    });

    it('should throw BadRequestException when printTime parameter is not "null"', async () => {
      await expect(
        service.listPrintJobs('printer-id', 'invalid-value'),
      ).rejects.toThrow(BadRequestException);
      
      await expect(
        service.listPrintJobs('printer-id', '2023-01-01T00:00:00Z'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should filter jobs without print time when printTime is "null"', async () => {
      const printerId = 'printer-id';
      const mockPrinter = { id: printerId };
      const mockPrintJobs = [
        {
          id: 'job-1',
          printerId,
          printJobTypeId: PrintJobType.RECEIPT,
          printTime: null,
          creationTime: new Date(),
        },
      ];

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.find.mockResolvedValue(mockPrintJobs);
      mockReceiptPrintJobRepository.findOne.mockResolvedValue({
        id: 'job-1',
        data: { $type: 'text', value: 'Test' },
      });

      const result = await service.listPrintJobs(printerId, 'null');

      expect(mockPrintJobRepository.find).toHaveBeenCalledWith({
        where: { printerId, printTime: null },
        order: { creationTime: 'DESC' },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('job-1');
    });

    it('should return all jobs when printTime parameter is omitted', async () => {
      const printerId = 'printer-id';
      const mockPrinter = { id: printerId };
      const mockPrintJobs = [
        {
          id: 'job-1',
          printerId,
          printJobTypeId: PrintJobType.RECEIPT,
          printTime: null,
          creationTime: new Date(),
        },
        {
          id: 'job-2',
          printerId,
          printJobTypeId: PrintJobType.RECEIPT,
          printTime: '2023-01-01T12:00:00Z',
          creationTime: new Date(),
        },
      ];

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.find.mockResolvedValue(mockPrintJobs);
      mockReceiptPrintJobRepository.findOne
        .mockResolvedValueOnce({
          id: 'job-1',
          data: { $type: 'text', value: 'Test1' },
        })
        .mockResolvedValueOnce({
          id: 'job-2',
          data: { $type: 'text', value: 'Test2' },
        });

      const result = await service.listPrintJobs(printerId);

      expect(mockPrintJobRepository.find).toHaveBeenCalledWith({
        where: { printerId },
        order: { creationTime: 'DESC' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('updatePrintJob', () => {
    it('should throw NotFoundException when printer does not exist', async () => {
      mockPrinterRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePrintJob('non-existent-printer-id', 'job-id', {
          collectionTime: '2023-01-01T00:00:00Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when print job does not exist', async () => {
      const printerId = 'printer-id';
      const jobId = 'non-existent-job-id';
      const mockPrinter = { id: printerId };

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updatePrintJob(printerId, jobId, {
          printTime: '2023-01-01T00:00:00Z',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should update collectionTime only', async () => {
      const printerId = 'printer-id';
      const jobId = 'job-id';
      const collectionTime = '2023-01-01T00:00:00Z';
      
      const mockPrinter = { id: printerId };
      const mockPrintJob = {
        id: jobId,
        printerId,
        printJobTypeId: PrintJobType.RECEIPT,
        collectionTime: null,
        printTime: null,
      };
      const mockUpdatedPrintJob = {
        ...mockPrintJob,
        collectionTime,
      };
      const mockReceiptPrintJob = {
        id: jobId,
        data: { $type: 'text', value: 'Test' },
      };

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.findOne
        .mockResolvedValueOnce(mockPrintJob) // First call for validation
        .mockResolvedValueOnce(mockUpdatedPrintJob); // Second call after update
      mockPrintJobRepository.update.mockResolvedValue({ affected: 1 });
      mockReceiptPrintJobRepository.findOne.mockResolvedValue(mockReceiptPrintJob);

      const result = await service.updatePrintJob(printerId, jobId, {
        collectionTime,
      });

      expect(mockPrintJobRepository.update).toHaveBeenCalledWith(jobId, {
        collectionTime,
      });
      expect(result.collectionTime).toBe(collectionTime);
      expect(result.printTime).toBe(null);
    });

    it('should update printTime only', async () => {
      const printerId = 'printer-id';
      const jobId = 'job-id';
      const printTime = '2023-01-01T12:00:00Z';
      
      const mockPrinter = { id: printerId };
      const mockPrintJob = {
        id: jobId,
        printerId,
        printJobTypeId: PrintJobType.RECEIPT,
        collectionTime: null,
        printTime: null,
      };
      const mockUpdatedPrintJob = {
        ...mockPrintJob,
        printTime,
      };

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.findOne
        .mockResolvedValueOnce(mockPrintJob) // First call for validation
        .mockResolvedValueOnce(mockUpdatedPrintJob); // Second call after update
      mockPrintJobRepository.update.mockResolvedValue({ affected: 1 });
      mockReceiptPrintJobRepository.findOne.mockResolvedValue({
        id: jobId,
        data: { $type: 'text', value: 'Test' },
      });

      const result = await service.updatePrintJob(printerId, jobId, {
        printTime,
      });

      expect(mockPrintJobRepository.update).toHaveBeenCalledWith(jobId, {
        printTime,
      });
      expect(result.printTime).toBe(printTime);
      expect(result.collectionTime).toBe(null);
    });

    it('should update both collectionTime and printTime', async () => {
      const printerId = 'printer-id';
      const jobId = 'job-id';
      const collectionTime = '2023-01-01T00:00:00Z';
      const printTime = '2023-01-01T12:00:00Z';
      
      const mockPrinter = { id: printerId };
      const mockPrintJob = {
        id: jobId,
        printerId,
        printJobTypeId: PrintJobType.RECEIPT,
        collectionTime: null,
        printTime: null,
      };
      const mockUpdatedPrintJob = {
        ...mockPrintJob,
        collectionTime,
        printTime,
      };

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.findOne
        .mockResolvedValueOnce(mockPrintJob) // First call for validation
        .mockResolvedValueOnce(mockUpdatedPrintJob); // Second call after update
      mockPrintJobRepository.update.mockResolvedValue({ affected: 1 });
      mockReceiptPrintJobRepository.findOne.mockResolvedValue({
        id: jobId,
        data: { $type: 'text', value: 'Test' },
      });

      const result = await service.updatePrintJob(printerId, jobId, {
        collectionTime,
        printTime,
      });

      expect(mockPrintJobRepository.update).toHaveBeenCalledWith(jobId, {
        collectionTime,
        printTime,
      });
      expect(result.collectionTime).toBe(collectionTime);
      expect(result.printTime).toBe(printTime);
    });

    it('should return current job when no fields to update', async () => {
      const printerId = 'printer-id';
      const jobId = 'job-id';
      
      const mockPrinter = { id: printerId };
      const mockPrintJob = {
        id: jobId,
        printerId,
        printJobTypeId: PrintJobType.RECEIPT,
        collectionTime: '2023-01-01T00:00:00Z',
        printTime: '2023-01-01T12:00:00Z',
      };

      mockPrinterRepository.findOne.mockResolvedValue(mockPrinter);
      mockPrintJobRepository.findOne.mockResolvedValue(mockPrintJob);
      mockReceiptPrintJobRepository.findOne.mockResolvedValue({
        id: jobId,
        data: { $type: 'text', value: 'Test' },
      });

      const result = await service.updatePrintJob(printerId, jobId, {});

      expect(mockPrintJobRepository.update).not.toHaveBeenCalled();
      expect(result.id).toBe(jobId);
    });
  });
});