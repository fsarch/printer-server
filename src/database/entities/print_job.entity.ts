import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'print_job',
})
export class PrintJob {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__print_job',
  })
  id: string;

  @Column({
    name: 'printer_id',
    type: 'uuid',
    nullable: false,
  })
  printerId: string;

  @Column({
    name: 'print_job_type_id',
    type: 'uuid',
    nullable: false,
  })
  printJobTypeId: string;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: '256',
    nullable: true,
  })
  externalId: string;

  @Column({
    name: 'collection_printer_credential_id',
    type: 'uuid',
    nullable: true,
  })
  collectionPrinterCredentialId: string | null;

  @Column({
    name: 'collection_time',
    type: 'timestamptz',
    nullable: true,
  })
  collectionTime: string | null;

  @Column({
    name: 'print_time',
    type: 'timestamptz',
    nullable: true,
  })
  printTime: string | null;

  @CreateDateColumn({
    name: 'creation_time',
  })
  creationTime: Date;
}
