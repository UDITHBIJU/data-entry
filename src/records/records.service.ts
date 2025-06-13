import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Record } from './entities/record.entity';
import { AuditLog } from './entities/audit-log.entity';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { UsersService } from 'src/users/users.service';
import { BatchesService } from 'src/batches/batches.service';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(Record)
    private recordsRepository: Repository<Record>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    private usersService: UsersService,
    private batchesService: BatchesService,
  ) {}

  async create(createRecordDto: CreateRecordDto, userId: string) {

    const user = await this.usersService.findOne(userId);
    const batch = await this.batchesService.findOrCreateCurrentBatch();

    const record = this.recordsRepository.create({
      ...createRecordDto,
      enteredBy: user.username,
      batch: batch,
      assignedTo: user,
    });

    const savedRecord = await this.recordsRepository.save(record);
    await this.createAuditLog('create', {}, savedRecord, userId);
    return savedRecord;
  }
  async findAll(userId: string, page: number, limit: number, search?: string) {
    const user = await this.usersService.findOne(userId);
    const query = this.recordsRepository
      .createQueryBuilder('record')
      .where('record.assignedToId = :userId', { userId: user.id })
      .andWhere('record.isLocked = :isLocked', { isLocked: false })
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere('record.searchVector @@ to_tsquery(:search)', {
        search: search + ':*',
      });
    }
    return query.getMany();
  }

  async findOne(id: string, userId: string) {
    const record = await this.recordsRepository.findOne({
      where: { id, assignedTo: { id: userId } },
    });
    if (!record) {
      throw new NotFoundException(`Record with ID ${id} not found`);
    }
    return record;
  }

  async lockRecord(id: string, userId: string) {
    const record = await this.findOne(id, userId);
    if (record.isLocked) {
      throw new ForbiddenException('Record is already locked');
    }
    record.isLocked = true;
    record.lockedBy = userId;
    record.lockTimestamp = new Date();
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    record.assignedTo = user;
    await this.recordsRepository.save(record);
    await this.createAuditLog('lock', {}, record, userId);
    setTimeout(() => this.unlockRecord(id), 10 * 60 * 1000);

    return record;
  }

  async unlockRecord(id: string) {
    const record = await this.recordsRepository.findOne({
      where: { id },
      relations: ['assignedTo'], // Explicitly load the assignedTo relation
    });
    if (record && record.isLocked) {
      record.isLocked = false;
      record.lockedBy = null;
      record.lockTimestamp = null;
      await this.recordsRepository.save(record);
      const auditUserId = record.assignedTo?.id || record.lockedBy;
      if (auditUserId) {
        await this.createAuditLog('unlock', {}, record, auditUserId);
      } else {
        // Log a warning if no user ID is available (for debugging)
        console.warn(`No assignedTo or lockedBy for unlocked record ID ${id}`);
      }
    }
  }
  async update(id: string, updateRecordDto: UpdateRecordDto, userId: string) {
    const record = await this.findOne(id, userId);
    const oldData = { ...record };
    Object.assign(record, updateRecordDto);
    record.searchVector = this.generateSearchVector(UpdateRecordDto);

    const updatedRecord = await this.recordsRepository.save(record);
    await this.createAuditLog(
      'update',
      this.getChanges(oldData, updatedRecord),
      updatedRecord,
      userId,
    );
    await this.unlockRecord(id);
    return updatedRecord;
  }

  async verify(id: string, status: 'good' | 'bad', userId: string) {
    const record = await this.lockRecord(id, userId);
    const user = await this.usersService.findOne(userId);

    record.status = status;
    record.reviewedBy = user.username;
    record.reviewedByDate = new Date();
    record.isLocked = true;

    const updatedRecord = await this.recordsRepository.save(record);
    await this.createAuditLog('verify', { status }, updatedRecord, userId);

    return updatedRecord;
  }

  private generateSearchVector(data: any): string {
    return `${data.propertyAddress} ${data.borrowerName} ${data.apn}`.toLocaleLowerCase();
  }

  private async createAuditLog(
    action: string,
    changes: any,
    record: Record,
    userId: string,
  ) {
    const auditLog = this.auditLogRepository.create({
      action,
      changes,
      timestamp: new Date(),
      record,
      user: { id: userId },
    });
    await this.auditLogRepository.save(auditLog);
  }

  private getChanges(oldData: Record, newData: Record): any {
    const changes = {};
    Object.keys(newData).forEach((key) => {
      if (oldData[key] !== newData[key]) {
        changes[key] = {
          old: oldData[key],
          new: newData[key],
        };
      }
    });
    return changes;
  }
  async autocomplete(userId: string, query: string) {
    if (!query) throw new BadRequestException('Query is required');
    const user = await this.usersService.findOne(userId);
    const suggestions = await this.recordsRepository
      .createQueryBuilder('record')
      .select(['record.borrowerName', 'record.propertyAddress', 'record.apn'])
      .where('record.assignedToId = :userId', { userId: user.id })
      .andWhere('record.isLocked = :isLocked', { isLocked: false })
      .andWhere('record.searchVector @@ to_tsquery(:search)', {
        search: query + ':*',
      })
      .take(5) // Limit to 5 suggestions
      .getMany();

    return suggestions.map((record) => ({
      borrowerName: record.borrowerName,
      propertyAddress: record.propertyAddress,
      apn: record.apn,
    }));
  }
}
