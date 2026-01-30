import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { RoomConflictModule } from '../room-conflict/room-conflict.module';
import { Room } from '../room/entities/room.entity';
import { Staff } from '../staff/entities/staff.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';
import { RescheduleRequest } from './entities/reschedule-request.entity';
import { RescheduleRequestController } from './reschedule-request.controller';
import { RescheduleRequestService } from './reschedule-request.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RescheduleRequest,
      ClassSession,
      TimeSlot,
      Room,
      Staff,
    ]),
    RoomConflictModule,
  ],
  controllers: [RescheduleRequestController],
  providers: [RescheduleRequestService],
})
export class RescheduleRequestModule {}
