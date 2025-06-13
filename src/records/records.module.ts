import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Record } from "./entities/record.entity";
import { RecordsService } from "./records.service";
import { RecordsController } from "./records.controller";
import { AuditLog } from "./entities/audit-log.entity";
import { UsersModule } from "src/users/users.module";
import { BatchesModule } from "src/batches/batches.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Record, AuditLog]),
    UsersModule,
    BatchesModule,
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
  exports: [RecordsService],
})
export class RecordsModule {}