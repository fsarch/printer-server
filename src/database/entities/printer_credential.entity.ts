import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'printer_credential',
})
export class PrinterCredential {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__printer_credential',
  })
  id: string;

  @Column({
    name: 'printer_id',
    type: 'uuid',
    nullable: false,
  })
  printerId: string;

  @Column({
    name: 'name',
    length: '512',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'external_id',
    type: 'varchar',
    length: '256',
    nullable: true,
  })
  externalId: string;

  @Column({
    name: 'token',
    type: 'varchar',
    length: '512',
    nullable: false,
  })
  token: string;

  @CreateDateColumn({
    name: 'creation_time',
  })
  creationTime: Date;

  @DeleteDateColumn({
    name: 'deletion_time',
  })
  deletionTime: Date;
}
