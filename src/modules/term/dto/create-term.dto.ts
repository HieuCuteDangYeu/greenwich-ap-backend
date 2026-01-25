import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class CreateTermDto {
  @ApiProperty({
    description: 'Programme identifier to which the term belongs.',
  })
  @IsNumber()
  programmeId!: number;

  @ApiProperty({ maxLength: 20 })
  @IsString()
  @MaxLength(20)
  code!: string;

  @ApiProperty({
    maxLength: 150,
    description: 'Term name in the format "<Term> <Year>", e.g. "Spring 2025".',
    example: 'Spring 2025',
  })
  @IsString()
  @MaxLength(150)
  @Matches(/^(Spring|Summer|Fall)\s+\d{4}$/i, {
    message:
      'Term name must be "Spring <Year>", "Summer <Year>", or "Fall <Year>".',
  })
  name!: string;

  @ApiProperty({ required: false, type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ required: false, type: String, format: 'date' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    required: false,
    type: [Number],
    description: 'Departments associated with this term.',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  departmentIds?: number[];
}
