import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
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
    description: 'Mentor ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  mentorId?: number;

  @ApiProperty({
    description: 'Class ID',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  classId?: number;

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

  @ApiProperty({
    description: 'Start year',
    example: '1',
  })
  @IsNotEmpty()
  @IsString()
  startYear!: string;

  @ApiProperty({
    description: 'Start term',
    example: 'Spring 2025',
  })
  @IsNotEmpty()
  @IsString()
  startTerm!: string;

  @ApiProperty({
    description: 'End term',
    example: 'Fall 2028',
  })
  @IsNotEmpty()
  @IsString()
  endTerm!: string;
}
