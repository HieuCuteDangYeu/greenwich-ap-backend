import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomConflictModule } from '../room-conflict/room-conflict.module';
import { Room } from '../room/entities/room.entity';
import { TimeSlot } from '../time-slot/entities/time-slot.entity';
import { User } from '../user/entities/user.entity';
import { RoomBookingSlot } from './entities/room-booking-slot.entity';
import { RoomBooking } from './entities/room-booking.entity';
import { RoomBookingController } from './room-booking.controller';
import { RoomBookingService } from './room-booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoomBooking,
      RoomBookingSlot,
      Room,
      TimeSlot,
      User,
    ]),
    RoomConflictModule,
  ],
  controllers: [RoomBookingController],
  providers: [RoomBookingService],
})
export class RoomBookingModule {}
