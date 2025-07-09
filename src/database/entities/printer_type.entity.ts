import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'printer_type',
})
export class PrinterType {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__printer_type',
  })
  id: string;

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
}
