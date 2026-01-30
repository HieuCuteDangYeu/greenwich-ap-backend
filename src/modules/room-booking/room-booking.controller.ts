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
import {
  ApiController,
  ApiCreateOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
  CommonApiResponses,
} from '../../common/decorators/swagger.decorator';
import { UserRole } from '../../common/enums/roles.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../user/entities/user.entity';
import { CreateRoomBookingDto } from './dto/create-room-booking.dto';
import { RoomBooking } from './entities/room-booking.entity';
import { RoomBookingService } from './room-booking.service';

@ApiController('Room Bookings', { requireAuth: true })
@Controller('room-bookings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoomBookingController {
  constructor(private readonly roomBookingService: RoomBookingService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT, UserRole.GUARDIAN)
  @ApiCreateOperation(RoomBooking)
  create(@CurrentUser() user: User, @Body() dto: CreateRoomBookingDto) {
    return this.roomBookingService.create(user.id, dto);
  }

  @Get('my')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT, UserRole.GUARDIAN)
  @ApiFindAllOperation(RoomBooking)
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findMyBookings(
    @CurrentUser() user: User,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.roomBookingService.findMyBookings(user.id, {
      status: status as any,
      from,
      to,
    });
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiFindAllOperation(RoomBooking)
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'roomId', required: false })
  @ApiQuery({ name: 'requesterUserId', required: false })
  @ApiQuery({ name: 'from', required: false })
  @ApiQuery({ name: 'to', required: false })
  findAll(
    @Query('status') status?: string,
    @Query('roomId') roomId?: string,
    @Query('requesterUserId') requesterUserId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.roomBookingService.findAll({
      status: status as any,
      roomId: roomId ? Number(roomId) : undefined,
      requesterUserId: requesterUserId ? Number(requesterUserId) : undefined,
      from,
      to,
    });
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT, UserRole.GUARDIAN)
  @ApiFindOneOperation(RoomBooking)
  findOne(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.roomBookingService.findOne(id, user);
  }

  @Patch(':id/approve')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiUpdateOperation(RoomBooking)
  @ApiOperation({ summary: 'Approve a room booking' })
  approve(@Param('id', ParseIntPipe) id: number) {
    return this.roomBookingService.approve(id);
  }

  @Patch(':id/reject')
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  @ApiUpdateOperation(RoomBooking)
  @ApiOperation({ summary: 'Reject a room booking' })
  reject(@Param('id', ParseIntPipe) id: number) {
    return this.roomBookingService.reject(id);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.ADMIN, UserRole.STAFF, UserRole.STUDENT, UserRole.GUARDIAN)
  @ApiUpdateOperation(RoomBooking)
  @ApiOperation({ summary: 'Cancel a room booking' })
  @CommonApiResponses()
  cancel(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.roomBookingService.cancel(id, user);
  }
}
