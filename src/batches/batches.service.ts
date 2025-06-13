import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Batch } from './entities/batch.entity';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private batchesRepository: Repository<Batch>,
  ) {}

  async findOrCreateCurrentBatch(): Promise<Batch> {
    const today = new Date();
    const batchName = `Batch-${today.toISOString().split('T')[0]}`;

    let batch = await this.batchesRepository.findOne({
      where: { name: batchName },
    });
    if (!batch) {
      batch = this.batchesRepository.create({
        name: batchName,
        startDate: today,
      });
      await this.batchesRepository.save(batch);
    }
    return batch;
  }

  async findAll(): Promise<Batch[]> {
    return this.batchesRepository.find();
  }
}
