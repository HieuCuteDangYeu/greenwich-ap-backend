import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { UserInStudentDto } from './user-in-student.dto';

export class CreateStudentDto {
  @ApiProperty({
    description: 'User Info',
    type: () => UserInStudentDto,
  })
  @ValidateNested()
  @Type(() => UserInStudentDto)
  @IsNotEmpty()
  user!: UserInStudentDto;

  @ApiProperty({
    description: 'Unique student code',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  studentCode!: string;

  @ApiProperty({
    description: 'Enrolment Day',
    required: true,
    example: '2025-09-01',
  })
  @IsNotEmpty()
  @IsDateString()
  enrolmentDay!: string;

  @ApiProperty({
    description: 'Program duration in years',
    required: false,
    example: 4,
    default: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  programDurationYears?: number;

  @ApiProperty({
    description: 'Mentor ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  mentorId?: number;

  @ApiProperty({
    description: 'Faculty name',
    example: 'Computing',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  faculty!: string;

  @ApiProperty({
    description: 'Student status',
    enum: ['ENROLLED', 'SUSPENDED', 'GRADUATED', 'DROPPED'],
    example: 'ENROLLED',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ENROLLED', 'SUSPENDED', 'GRADUATED', 'DROPPED'])
  status?: 'ENROLLED' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED';
}
