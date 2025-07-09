import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'printer',
})
export class Printer {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__printer',
  })
  id: string;

  @Column({
    name: 'printer_type_id',
    type: 'uuid',
    nullable: false,
  })
  printerTypeId: string;

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
  })
  externalId: string;

  @CreateDateColumn({
    name: 'creation_time',
  })
  creationTime: Date;

  @DeleteDateColumn({
    name: 'deletion_time',
  })
  deletionTime: Date;
}
