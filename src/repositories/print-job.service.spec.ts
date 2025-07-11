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
      expect(result.receiptData).toEqual({ $type: 'text', value: 'Hello' });
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
      expect(result[0].receiptData).toEqual({ $type: 'text', value: 'Test' });
    });
  });
});