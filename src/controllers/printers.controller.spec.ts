import { Test, TestingModule } from '@nestjs/testing';
import { PrintersController } from './printers.controller';
import { PrinterService } from '../repositories/printer.service';
import { CreatePrinterDto, PatchPrinterDto, PrinterDto } from '../models/printer.dto';

describe('PrintersController', () => {
  let controller: PrintersController;
  let service: PrinterService;

  const mockPrinterService = {
    CreatePrinter: jest.fn(),
    GetById: jest.fn(),
    ListPrinters: jest.fn(),
    UpdatePrinter: jest.fn(),
    DeleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrintersController],
      providers: [
        {
          provide: PrinterService,
          useValue: mockPrinterService,
        },
      ],
    }).compile();

    controller = module.get<PrintersController>(PrintersController);
    service = module.get<PrinterService>(PrinterService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new printer', async () => {
      const createPrinterDto: CreatePrinterDto = {
        printerTypeId: 'type-uuid',
        name: 'Test Printer',
        externalId: 'external-123',
      };

      const mockPrinter = {
        id: 'printer-uuid',
        ...createPrinterDto,
        creationTime: new Date(),
        deletionTime: null,
      };

      mockPrinterService.CreatePrinter.mockResolvedValue(mockPrinter);

      const result = await controller.create(createPrinterDto);

      expect(mockPrinterService.CreatePrinter).toHaveBeenCalledWith(createPrinterDto);
      expect(result).toEqual(PrinterDto.FromDbo(mockPrinter));
    });
  });

  describe('findAll', () => {
    it('should return a list of printers', async () => {
      const mockPrinters = [
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

      mockPrinterService.ListPrinters.mockResolvedValue(mockPrinters);

      const result = await controller.findAll();

      expect(mockPrinterService.ListPrinters).toHaveBeenCalled();
      expect(result).toEqual(mockPrinters.map(printer => PrinterDto.FromDbo(printer)));
    });
  });

  describe('findOne', () => {
    it('should return a single printer', async () => {
      const printerId = 'printer-uuid';
      const mockPrinter = {
        id: printerId,
        printerTypeId: 'type-uuid',
        name: 'Test Printer',
        externalId: 'external-123',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockPrinterService.GetById.mockResolvedValue(mockPrinter);

      const result = await controller.findOne(printerId);

      expect(mockPrinterService.GetById).toHaveBeenCalledWith(printerId);
      expect(result).toEqual(PrinterDto.FromDbo(mockPrinter));
    });
  });

  describe('update', () => {
    it('should update a printer', async () => {
      const printerId = 'printer-uuid';
      const patchPrinterDto: PatchPrinterDto = {
        name: 'Updated Printer Name',
      };

      const updatedPrinter = {
        id: printerId,
        printerTypeId: 'type-uuid',
        name: 'Updated Printer Name',
        externalId: 'external-123',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockPrinterService.UpdatePrinter.mockResolvedValue(updatedPrinter);

      const result = await controller.update(printerId, patchPrinterDto);

      expect(mockPrinterService.UpdatePrinter).toHaveBeenCalledWith(printerId, patchPrinterDto);
      expect(result).toEqual(PrinterDto.FromDbo(updatedPrinter));
    });
  });

  describe('remove', () => {
    it('should delete a printer', async () => {
      const printerId = 'printer-uuid';

      mockPrinterService.DeleteById.mockResolvedValue(undefined);

      await controller.remove(printerId);

      expect(mockPrinterService.DeleteById).toHaveBeenCalledWith(printerId);
    });
  });
});