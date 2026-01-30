import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { RoomBookingSlot } from '../room-booking/entities/room-booking-slot.entity';
import { RoomBooking } from '../room-booking/entities/room-booking.entity';
import { RoomConflictService } from './room-conflict.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClassSession, RoomBooking, RoomBookingSlot]),
  ],
  providers: [RoomConflictService],
  exports: [RoomConflictService],
})
export class RoomConflictModule {}
