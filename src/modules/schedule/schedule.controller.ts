import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import {
  ApiController,
  ApiFindAllOperation,
} from '../../common/decorators/swagger.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ScheduleItemDto } from './dto/schedule-item.dto';
import { ScheduleService } from './schedule.service';

@ApiController('Schedule', { requireAuth: true })
@Controller('schedule')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Get()
  @ApiFindAllOperation(ScheduleItemDto)
  @ApiQuery({ name: 'from', required: true })
  @ApiQuery({ name: 'to', required: true })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'timeSlotId', required: false })
  @ApiQuery({ name: 'classId', required: false })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'teacherId', required: false })
  @ApiQuery({ name: 'requesterUserId', required: false })
  getSchedule(
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('roomId') roomId?: string,
    @Query('timeSlotId') timeSlotId?: string,
    @Query('classId') classId?: string,
    @Query('courseId') courseId?: string,
    @Query('teacherId') teacherId?: string,
    @Query('requesterUserId') requesterUserId?: string,
  ) {
    return this.scheduleService.getSchedule({
      from,
      to,
      roomId: roomId ? Number(roomId) : undefined,
      timeSlotId: timeSlotId ? Number(timeSlotId) : undefined,
      classId: classId ? Number(classId) : undefined,
      courseId: courseId ? Number(courseId) : undefined,
      teacherId: teacherId ? Number(teacherId) : undefined,
      requesterUserId: requesterUserId ? Number(requesterUserId) : undefined,
    });
  }
}
