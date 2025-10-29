import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ATTENDANCE_STATUS } from '../entities/attendance.entity';
import type { AttendanceStatus } from '../entities/attendance.entity';

export class UpdateStudentAttendanceDto {
  @SwaggerProperty({
    description: 'Student ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  studentId!: number;

  @SwaggerProperty({
    description: 'Attendance status',
    enum: ATTENDANCE_STATUS,
    example: 'PRESENT',
  })
  @IsOptional()
  @IsEnum(ATTENDANCE_STATUS)
  status?: AttendanceStatus;

  @SwaggerProperty({
    description: 'Optional note about the attendance',
    required: false,
    example: 'Updated note',
  })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateBulkAttendanceDto {
  @SwaggerProperty({
    description: 'Class session ID',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  sessionId!: number;

  @SwaggerProperty({
    description: 'Array of student attendance updates',
    type: [UpdateStudentAttendanceDto],
    example: [
      { studentId: 1, status: 'PRESENT' },
      { studentId: 2, status: 'ABSENT', note: 'Sick leave' },
      { studentId: 3, status: 'PENDING' },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateStudentAttendanceDto)
  students!: UpdateStudentAttendanceDto[];
}
