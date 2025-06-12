import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Record } from '../records/entities/record.entity';
import { AuditLog } from '../records/entities/audit-log.entity';
import { Batch } from '../batches/entities/batch.entity';
import { User } from '../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

export const databaseConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [Record, AuditLog, Batch, User],
  synchronize: true,
  ssl: {
    rejectUnauthorized: false,
  },
});