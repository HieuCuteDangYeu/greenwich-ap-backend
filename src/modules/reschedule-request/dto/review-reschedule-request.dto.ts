import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ReviewRescheduleRequestDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reviewNote?: string;
}
