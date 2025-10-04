import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional } from 'class-validator';
import type { ClassSessionStatus } from '../entities/class-session.entity';
import { CLASS_SESSION_STATUS } from '../entities/class-session.entity';

export class CreateClassSessionDto {
  @ApiProperty({ description: 'Course assigned to the session' })
  @IsInt()
  courseId!: number;

  @ApiProperty({ type: String, format: 'date' })
  @IsDateString()
  dateOn!: string;

  @ApiProperty({ description: 'Room assigned to the session' })
  @IsInt()
  roomId!: number;

  @ApiProperty({ description: 'Teacher in charge of the session' })
  @IsInt()
  teacherId!: number;

  @ApiProperty({ enum: CLASS_SESSION_STATUS, required: false })
  @IsEnum(CLASS_SESSION_STATUS)
  @IsOptional()
  status?: ClassSessionStatus;
}
