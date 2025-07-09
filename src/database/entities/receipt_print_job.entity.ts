import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'receipt_print_job',
})
export class ReceiptPrintJob {
  @PrimaryGeneratedColumn('uuid', {
    primaryKeyConstraintName: 'pk__receipt_print_job',
  })
  id: string;

  @Column({
    name: 'data',
    type: 'jsonb',
    nullable: false,
  })
  data: unknown;
}
