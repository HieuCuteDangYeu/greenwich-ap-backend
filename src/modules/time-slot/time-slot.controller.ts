import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TimeSlotService } from './time-slot.service';
import { CreateTimeSlotDto } from './dto/create-time-slot.dto';
import { UpdateTimeSlotDto } from './dto/update-time-slot.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ApiController,
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiFindAllOperation,
  ApiFindOneOperation,
  ApiUpdateOperation,
} from 'src/common/decorators/swagger.decorator';
import { TimeSlot } from './entities/time-slot.entity';
import { AssignTimeSlotDto } from './dto/assign-time-slots.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../../common/enums/roles.enum';

@ApiController('Time Slots', { requireAuth: true })
@Controller('time-slots')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.STAFF)
export class TimeSlotController {
  constructor(private readonly timeSlotService: TimeSlotService) {}

  @Post()
  @ApiCreateOperation(TimeSlot)
  create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    return this.timeSlotService.create(createTimeSlotDto);
  }

  @Get()
  @ApiFindAllOperation(TimeSlot)
  findAll() {
    return this.timeSlotService.findAll();
  }

  @Get(':id')
  @ApiFindOneOperation(TimeSlot)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.timeSlotService.findOne(id);
  }

  @Patch(':id')
  @ApiUpdateOperation(TimeSlot)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTimeSlotDto: UpdateTimeSlotDto,
  ) {
    return this.timeSlotService.update(id, updateTimeSlotDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteOperation(TimeSlot)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.timeSlotService.remove(id);
  }

  @Post('assign-slot')
  @ApiOperation({ summary: 'Assign a time slot to a class session' })
  @ApiResponse({
    status: 201,
    description: 'Time slot has been successfully assigned to the session.',
  })
  assignSlotToSession(@Body() assignTimeSlotDto: AssignTimeSlotDto) {
    return this.timeSlotService.assignSlotToSession(assignTimeSlotDto);
  }

  @Get('sessions/:sessionId')
  @ApiOperation({ summary: 'Get all time slots for a class session' })
  @ApiResponse({
    status: 200,
    description: 'Return all time slots for the session.',
  })
  getSessionSlots(@Param('sessionId', ParseIntPipe) sessionId: number) {
    return this.timeSlotService.getSessionSlots(sessionId);
  }

  @Delete('sessions/:sessionId/slot/:slotId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a time slot from a class session' })
  @ApiResponse({
    status: 204,
    description: 'Time slot has been successfully removed from the session.',
  })
  removeSlotFromSession(
    @Param('sessionId', ParseIntPipe) sessionId: number,
    @Param('slotId', ParseIntPipe) slotId: number,
  ) {
    return this.timeSlotService.removeSlotFromSession(sessionId, slotId);
  }
}
