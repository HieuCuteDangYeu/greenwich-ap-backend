import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayUnique,
  IsArray,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
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

  @ApiProperty({ maxLength: 150 })
  @IsString()
  @MaxLength(150)
  name!: string;

  @ApiProperty({ required: false, maxLength: 20 })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  academicYear?: string;

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
