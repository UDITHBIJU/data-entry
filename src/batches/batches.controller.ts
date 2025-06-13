import { Controller, Get, UseGuards } from '@nestjs/common';
import { BatchesService } from './batches.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('batches')
@UseGuards(AuthGuard('jwt'))
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  findAll() {
    return this.batchesService.findAll();
  }
}
