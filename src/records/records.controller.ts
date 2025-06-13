import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { RecordsService } from './records.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('records')
@UseGuards(AuthGuard('jwt'))
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@Body() createRecordDto: CreateRecordDto, @Request() req) {
    return this.recordsService.create(createRecordDto, req.user.userId);
  }

  @Get()
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search: string,
    @Request() req,
  ) {
    return this.recordsService.findAll(req.user.userId, page, limit, search);
  }

  @Get('autocomplete')
  autocomplete(@Request() req, @Query('query') query: string) {
    return this.recordsService.autocomplete(req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.recordsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRecordDto: UpdateRecordDto,
    @Request() req,
  ) {
    return this.recordsService.update(id, updateRecordDto, req.user.userId);
  }

  @Post(':id/verify/:status')
  verify(
    @Param('id') id: string,
    @Param('status') status: string,
    @Request() req,
  ) {
    if (!['good', 'bad'].includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return this.recordsService.verify(
      id,
      status as 'good' | 'bad',
      req.user.userId,
    );
  }

  @Post(':id/lock')
  lock(@Param('id') id: string, @Request() req) {
    return this.recordsService.lockRecord(id, req.user.userId);
  }

  @Post(':id/unlock')
  // @UseGuards(AuthGuard('jwt'))
  unlock(@Param('id') id: string, @Request() req) {
    return this.recordsService.unlockRecord(id);
  }
}
