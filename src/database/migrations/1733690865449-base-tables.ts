import { MigrationInterface, QueryRunner, Table } from 'typeorm';
import { getDataType } from './utils/data-type.mapper.js';
import { PrinterType } from "../../constants/printer-type.enum";
import { PrintJobType } from "../../constants/print-job-type.enum";

export class BaseTables1720373216667 implements MigrationInterface {
  name = 'BaseTables1720373216667';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const databaseType = queryRunner.connection.driver.options.type;

    // region PrinterType
    await queryRunner.createTable(
      new Table({
        name: 'printer_type',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__printer_type',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '512',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.manager.insert('printer_type', {
      id: PrinterType.RECEIPT,
      name: 'Receipt',
    });
    // endregion

    // region Printer
    await queryRunner.createTable(
      new Table({
        name: 'printer',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__printer',
          },
          {
            name: 'printer_type_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '512',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
          {
            name: 'creation_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletion_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: true,
          },
        ],
        indices: [{
          name: 'UQ__printer__external_id',
          columnNames: ['external_id'],
          where: 'deletion_time IS NULL'
        }, {
          name: 'IDX__printer__printer_type_id',
          columnNames: ['printer_type_id'],
        }],
        foreignKeys: [{
          name: 'FK__printer__printer_type_id',
          columnNames: ['printer_type_id'],
          referencedTableName: 'printer_type',
          referencedColumnNames: ['id'],
        }],
      }),
    );
    // endregion

    // region PrinterCredential
    await queryRunner.createTable(
      new Table({
        name: 'printer_credential',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__printer_credential',
          },
          {
            name: 'printer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '512',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '256',
            isNullable: true,
          },
          {
            name: 'token',
            type: 'varchar',
            length: '512',
            isNullable: false,
          },
          {
            name: 'creation_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'deletion_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: true,
          },
        ],
        indices: [{
          name: 'IDX__printer_credential__external_id',
          columnNames: ['external_id'],
        }, {
          name: 'IDX__printer_credential__printer_id',
          columnNames: ['printer_id'],
        }, {
          name: 'IDX__printer_credential__token__printer_id',
          columnNames: ['token', 'printer_id'],
          where: 'deletion_time IS NULL'
        }, {
          name: 'UI__printer_credential__token',
          columnNames: ['token'],
          isUnique: true,
          where: 'deletion_time IS NULL'
        }],
        foreignKeys: [{
          name: 'FK__printer_credential__printer_id',
          columnNames: ['printer_id'],
          referencedTableName: 'printer',
          referencedColumnNames: ['id'],
        }],
      }),
    );
    // endregion

    // region PrintJobType
    await queryRunner.createTable(
      new Table({
        name: 'print_job_type',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__print_job_type',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '512',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '512',
            isNullable: true,
          },
        ],
        indices: [{
          name: 'UQ__print_job_type__external_id',
          columnNames: ['external_id'],
        }],
      }),
    );

    await queryRunner.manager.insert('print_job_type', {
      id: PrintJobType.RECEIPT,
      name: 'Receipt',
    });
    // endregion

    // region PrintJob
    await queryRunner.createTable(
      new Table({
        name: 'print_job',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__print_job',
          },
          {
            name: 'printer_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'print_job_type_id',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'external_id',
            type: 'varchar',
            length: '256',
            isNullable: true,
          },
          {
            name: 'collection_printer_credential_id',
            type: 'uuid',
            isNullable: true,
          },
          {
            name: 'collection_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: true,
          },
          {
            name: 'print_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: true,
          },
          {
            name: 'creation_time',
            type: getDataType(databaseType, 'timestamp'),
            isNullable: false,
            default: 'now()',
          },
        ],
        indices: [{
          name: 'IDX__print_job__printer_id',
          columnNames: ['printer_id'],
        }, {
          name: 'IDX__print_job__print_job_type_id',
          columnNames: ['print_job_type_id'],
        }, {
          name: 'IDX__print_job__external_id',
          columnNames: ['external_id'],
        }],
        foreignKeys: [{
          name: 'FK__print_job__printer_id',
          columnNames: ['printer_id'],
          referencedTableName: 'printer',
          referencedColumnNames: ['id'],
        }, {
          name: 'FK__print_job__print_job_type_id',
          columnNames: ['print_job_type_id'],
          referencedTableName: 'print_job_type',
          referencedColumnNames: ['id'],
        }, {
          name: 'FK__print_job__collection_printer_credential_id',
          columnNames: ['collection_printer_credential_id'],
          referencedTableName: 'printer_credential',
          referencedColumnNames: ['id'],
        }],
      }),
    );
    // endregion

    // region ReceiptPrintJob
    await queryRunner.createTable(
      new Table({
        name: 'receipt_print_job',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: 'pk__receipt_print_job',
          },
          {
            name: 'data',
            type: 'jsonb',
            isNullable: false,
          },
        ],
        foreignKeys: [{
          name: 'fk__receipt_print_job__id',
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          columnNames: ['id'],
          referencedColumnNames: ['id'],
          referencedTableName: 'print_job',
        }],
      }),
    );
    // endregion
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('receipt_print_job');
    await queryRunner.dropTable('print_job');
    await queryRunner.dropTable('print_job_type');
    await queryRunner.dropTable('printer_credential');
    await queryRunner.dropTable('printer');
    await queryRunner.dropTable('printer_type');
  }
}
