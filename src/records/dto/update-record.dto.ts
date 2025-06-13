import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class UpdateRecordDto {
  @IsOptional()
  @IsString()
  propertyAddress?: string;

  @IsOptional()
  @IsDateString()
  transactionDate?: Date;

  @IsOptional()
  @IsString()
  borrowerName?: string;

  @IsOptional()
  @IsString()
  loanOfficerName?: string;

  @IsOptional()
  @IsString()
  nmlsId?: string;

  @IsOptional()
  @IsNumber()
  loanAmount?: number;

  @IsOptional()
  @IsNumber()
  loanTerm?: number;

  @IsOptional()
  @IsString()
  apn?: string;
}
