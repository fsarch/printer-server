import { Test, TestingModule } from '@nestjs/testing';
import { PrinterCredentialsController } from './printer-credentials.controller';
import { PrinterCredentialService } from '../repositories/printer-credential.service';
import {
  CreatePrinterCredentialDto,
  PatchPrinterCredentialDto,
  PrinterCredentialDto,
  PrinterCredentialWithTokenDto,
} from '../models/printer-credential.dto';

describe('PrinterCredentialsController', () => {
  let controller: PrinterCredentialsController;
  let service: PrinterCredentialService;

  const mockPrinterCredentialService = {
    CreatePrinterCredential: jest.fn(),
    GetById: jest.fn(),
    ListPrinterCredentials: jest.fn(),
    UpdatePrinterCredential: jest.fn(),
    DeleteById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrinterCredentialsController],
      providers: [
        {
          provide: PrinterCredentialService,
          useValue: mockPrinterCredentialService,
        },
      ],
    }).compile();

    controller = module.get<PrinterCredentialsController>(PrinterCredentialsController);
    service = module.get<PrinterCredentialService>(PrinterCredentialService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new printer credential with token', async () => {
      const printerId = 'printer-uuid';
      const createPrinterCredentialDto: CreatePrinterCredentialDto = {
        name: 'Test Credential',
        externalId: 'external-123',
      };

      const mockCredential = {
        id: 'credential-uuid',
        printerId,
        name: createPrinterCredentialDto.name,
        externalId: createPrinterCredentialDto.externalId || '',
        token: 'secure-generated-token',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockPrinterCredentialService.CreatePrinterCredential.mockResolvedValue(mockCredential);

      const result = await controller.create(printerId, createPrinterCredentialDto);

      expect(mockPrinterCredentialService.CreatePrinterCredential).toHaveBeenCalledWith(
        printerId,
        createPrinterCredentialDto,
      );
      expect(result).toEqual(PrinterCredentialWithTokenDto.FromDbo(mockCredential));
      expect(result.token).toBe('secure-generated-token');
    });
  });

  describe('findAll', () => {
    it('should return a list of printer credentials without tokens', async () => {
      const printerId = 'printer-uuid';
      const mockCredentials = [
        {
          id: 'credential-1',
          printerId,
          name: 'Credential 1',
          externalId: 'external-1',
          token: 'token-1',
          creationTime: new Date(),
          deletionTime: null,
        },
        {
          id: 'credential-2',
          printerId,
          name: 'Credential 2',
          externalId: 'external-2',
          token: 'token-2',
          creationTime: new Date(),
          deletionTime: null,
        },
      ];

      mockPrinterCredentialService.ListPrinterCredentials.mockResolvedValue(mockCredentials);

      const result = await controller.findAll(printerId);

      expect(mockPrinterCredentialService.ListPrinterCredentials).toHaveBeenCalledWith(printerId);
      expect(result).toEqual(
        mockCredentials.map((credential) => PrinterCredentialDto.FromDbo(credential)),
      );
      // Ensure tokens are not included
      result.forEach((credential) => {
        expect(credential).not.toHaveProperty('token');
      });
    });
  });

  describe('findOne', () => {
    it('should return a single printer credential without token', async () => {
      const printerId = 'printer-uuid';
      const credentialId = 'credential-uuid';
      const mockCredential = {
        id: credentialId,
        printerId,
        name: 'Test Credential',
        externalId: 'external-123',
        token: 'secret-token',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockPrinterCredentialService.GetById.mockResolvedValue(mockCredential);

      const result = await controller.findOne(printerId, credentialId);

      expect(mockPrinterCredentialService.GetById).toHaveBeenCalledWith(credentialId, printerId);
      expect(result).toEqual(PrinterCredentialDto.FromDbo(mockCredential));
      expect(result).not.toHaveProperty('token');
    });
  });

  describe('update', () => {
    it('should update a printer credential name', async () => {
      const printerId = 'printer-uuid';
      const credentialId = 'credential-uuid';
      const patchPrinterCredentialDto: PatchPrinterCredentialDto = {
        name: 'Updated Credential Name',
      };

      const updatedCredential = {
        id: credentialId,
        printerId,
        name: 'Updated Credential Name',
        externalId: 'external-123',
        token: 'secret-token',
        creationTime: new Date(),
        deletionTime: null,
      };

      mockPrinterCredentialService.UpdatePrinterCredential.mockResolvedValue(updatedCredential);

      const result = await controller.update(printerId, credentialId, patchPrinterCredentialDto);

      expect(mockPrinterCredentialService.UpdatePrinterCredential).toHaveBeenCalledWith(
        credentialId,
        printerId,
        patchPrinterCredentialDto,
      );
      expect(result).toEqual(PrinterCredentialDto.FromDbo(updatedCredential));
      expect(result).not.toHaveProperty('token');
    });
  });

  describe('remove', () => {
    it('should delete a printer credential', async () => {
      const printerId = 'printer-uuid';
      const credentialId = 'credential-uuid';

      mockPrinterCredentialService.DeleteById.mockResolvedValue(undefined);

      await controller.remove(printerId, credentialId);

      expect(mockPrinterCredentialService.DeleteById).toHaveBeenCalledWith(
        credentialId,
        printerId,
      );
    });
  });
});