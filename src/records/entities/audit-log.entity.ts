import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Record } from './record.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ type: 'json' })
  changes: any;

  @Column()
  timestamp: Date;

  @ManyToOne(() => Record)
  record: Record;

  @ManyToOne(() => User)
  user: User;
}
