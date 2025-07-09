import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'print_job_type',
})
export class PrintJobType {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__print_job_type',
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
