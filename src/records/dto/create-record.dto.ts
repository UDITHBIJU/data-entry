import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsPositive,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  propertyAddress: string;
 
  @IsDateString()
  @IsNotEmpty()
  transactionDate: Date;

  @IsString()
  @IsNotEmpty()
  borrowerName: string;

  @IsString()
  @IsNotEmpty()
  loanOfficerName: string;

  @IsString()
  @IsNotEmpty()
  nmlsId: string;

  @IsNumber()
  @IsPositive()
  @Transform(({ value }) => Number(value))
  loanAmount: number;

  @IsNumber()
  @Min(1)
  @Transform(({ value }) => Number(value))
  loanTerm: number;

  @IsString()
  @IsNotEmpty()
  apn: string;
}
