import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { StaffRoles } from '../../common/decorators/staff-roles.decorator';
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiUpdateOperation,
} from '../../common/decorators/swagger.decorator';
import { StaffRole, UserRole } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StaffRolesGuard } from '../auth/guards/staff-roles.guard';
import { User } from '../user/entities/user.entity';
import { CreateRescheduleRequestDto } from './dto/create-reschedule-request.dto';
import { ReviewRescheduleRequestDto } from './dto/review-reschedule-request.dto';
import { RescheduleRequest } from './entities/reschedule-request.entity';
import { RescheduleRequestService } from './reschedule-request.service';

@ApiController('Reschedule Requests', { requireAuth: true })
@Controller('reschedule-requests')
@UseGuards(JwtAuthGuard, RolesGuard, StaffRolesGuard)
export class RescheduleRequestController {
  constructor(
    private readonly rescheduleRequestService: RescheduleRequestService,
  ) {}

  @Post()
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @StaffRoles(StaffRole.TEACHER)
  @ApiCreateOperation(RescheduleRequest)
  create(@CurrentUser() user: User, @Body() dto: CreateRescheduleRequestDto) {
    return this.rescheduleRequestService.create(user, dto);
  }

  @Get('my')
  @Roles(UserRole.STAFF, UserRole.ADMIN)
  @StaffRoles(StaffRole.TEACHER)
  @ApiFindAllOperation(RescheduleRequest)
  findMyRequests(@CurrentUser() user: User) {
    return this.rescheduleRequestService.findMyRequests(user);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiFindAllOperation(RescheduleRequest)
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'sessionId', required: false })
  @ApiQuery({ name: 'requestedByTeacherId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('sessionId') sessionId?: string,
    @Query('requestedByTeacherId') requestedByTeacherId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.rescheduleRequestService.findAll({
      status,
      sessionId: sessionId ? Number(sessionId) : undefined,
      requestedByTeacherId: requestedByTeacherId
        ? Number(requestedByTeacherId)
        : undefined,
      from,
      to,
    });
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiUpdateOperation(RescheduleRequest)
  @ApiOperation({ summary: 'Approve a reschedule request' })
  approve(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewRescheduleRequestDto,
  ) {
    return this.rescheduleRequestService.approve(id, user, dto);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiUpdateOperation(RescheduleRequest)
  @ApiOperation({ summary: 'Reject a reschedule request' })
  reject(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReviewRescheduleRequestDto,
  ) {
    return this.rescheduleRequestService.reject(id, user, dto);
  }
}
