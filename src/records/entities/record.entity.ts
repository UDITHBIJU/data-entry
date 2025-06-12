import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Batch } from '../../batches/entities/batch.entity';

@Entity()
export class Record {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  propertyAddress: string;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column()
  borrowerName: string;

  @Column()
  loanOfficerName: string;
 
  @Column()
  nmlssId: string;

  @Column()
  loanAmount: number;

  @Column()
  loanTerm: number;

  @Column({ type: 'decimal', generatedType: 'VIRTUAL', select: false })
  downPayment: number;

  @Column()
  apn: string;

  @Column({ nullable: true })
  enteredBy: string;

  @CreateDateColumn()
  enteredByDate: Date;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ type: 'date', nullable: true })
  reviewedByDate: Date;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true })
  lockedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  lockTimestamp: Date;

  @Column({ default: 'pending' })
  status: string;

  @ManyToOne(() => Batch, (batch) => batch.records)
  batch: Batch;

  @ManyToOne(() => User)
  assignedTo: User;

  @Column({ type: 'tsvector', nullable: true })
  searchVector: string;
}
