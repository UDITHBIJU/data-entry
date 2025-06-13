import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule,ConfigService} from '@nestjs/config';
import { RecordsModule } from './records/records.module';
import { BatchesModule } from './batches/batches.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env', // Make sure this points to your .env file
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        databaseConfig(configService),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RecordsModule,
    BatchesModule, 
  ],
})
export class AppModule {}
