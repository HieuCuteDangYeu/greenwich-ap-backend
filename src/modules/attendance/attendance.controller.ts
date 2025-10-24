import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiOperation } from '@nestjs/swagger';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  ApiDeleteOperation,
} from '../../common/decorators/swagger.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { Attendance } from './entities/attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { StudentScheduleResponseDto } from './dto/student-schedule-response.dto';
import { StaffRole, UserRole } from '../../common/enums/roles.enum';
import { StaffRolesGuard } from '../auth/guards/staff-roles.guard';
import { StaffRoles } from '../../common/decorators/staff-roles.decorator';

@ApiController('Attendance', { requireAuth: true })
@Controller('attendance')
@UseGuards(JwtAuthGuard, RolesGuard, StaffRolesGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  // CREATE
  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @StaffRoles(StaffRole.TEACHER)
  @ApiCreateOperation(Attendance, 'Create new attendance record')
  create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  // READ all
  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @StaffRoles(StaffRole.TEACHER)
  @ApiFindAllOperation(Attendance, 'List all attendance records')
  @ApiQuery({
    name: 'studentId',
    description: 'Filter by student ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'sessionId',
    description: 'Filter by session ID',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by attendance status',
    required: false,
    enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'],
  })
  @ApiQuery({
    name: 'classId',
    description: 'Filter by class ID',
    required: false,
    type: Number,
  })
  async findAll(
    @Query('studentId') studentId?: number,
    @Query('sessionId') sessionId?: number,
    @Query('status') status?: string,
    @Query('classId') classId?: number,
  ) {
    return this.attendanceService.findAll({
      studentId,
      sessionId,
      status,
      classId,
    });
  }

  // GET student schedule with attendance
  // Returns student's schedule with attendance status for a date range (maximum 7 days)
  // Includes: class, course, room, teacher, attendance status, day of week, time slots
  @Get('schedule')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @StaffRoles(StaffRole.TEACHER)
  @ApiOperation({
    summary:
      'Get student schedule with attendance for a date range (max 7 days)',
  })
  @ApiQuery({
    name: 'studentId',
    description: 'Student ID',
    required: true,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: 'startDate',
    description: 'Start date (YYYY-MM-DD). Date range must not exceed 7 days.',
    required: true,
    type: String,
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'endDate',
    description: 'End date (YYYY-MM-DD). Date range must not exceed 7 days.',
    required: true,
    type: String,
    example: '2025-10-07',
  })
  async getStudentSchedule(
    @Query('studentId', ParseIntPipe) studentId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<StudentScheduleResponseDto> {
    return this.attendanceService.getStudentSchedule(
      studentId,
      startDate,
      endDate,
    );
  }

  // READ one
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @StaffRoles(StaffRole.TEACHER)
  @ApiFindOneOperation(Attendance, 'Get attendance record by ID')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @StaffRoles(StaffRole.TEACHER)
  @ApiUpdateOperation(Attendance, 'Update attendance record')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.attendanceService.update(id, dto);
  }

  // DELETE
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiDeleteOperation(Attendance, 'Delete attendance record')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.attendanceService.remove(id);
  }

  // GET student attendance statistics
  @Get('student/:studentId/stats')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT)
  @StaffRoles(StaffRole.TEACHER)
  @ApiFindOneOperation(Attendance, 'Get attendance statistics for a student')
  getStudentStats(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.attendanceService.getStudentStats(studentId);
  }
}
