import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassSession } from '../class/entities/class-session.entity';
import { RoomBooking } from '../room-booking/entities/room-booking.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([ClassSession, RoomBooking])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
