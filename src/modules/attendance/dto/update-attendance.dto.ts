import { SwaggerProperty } from '../../../common/decorators/swagger.decorator';
import { IsNumber, IsEnum, IsOptional, IsString } from 'class-validator';
import { ATTENDANCE_STATUS } from '../entities/attendance.entity';
import type { AttendanceStatus } from '../entities/attendance.entity';

export class UpdateAttendanceDto {
  @SwaggerProperty({
    description: 'Student ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  studentId?: number;

  @SwaggerProperty({
    description: 'Class session ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @SwaggerProperty({
    description: 'Attendance status',
    enum: ATTENDANCE_STATUS,
    example: 'ABSENT',
    required: false,
  })
  @IsOptional()
  @IsEnum(ATTENDANCE_STATUS)
  status?: AttendanceStatus;

  @SwaggerProperty({
    description: 'Optional note about the attendance',
    required: false,
    example: 'Student was absent due to illness',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
