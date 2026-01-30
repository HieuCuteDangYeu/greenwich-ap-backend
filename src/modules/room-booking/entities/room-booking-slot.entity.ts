import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { TimeSlot } from '../../time-slot/entities/time-slot.entity';
import { RoomBooking } from './room-booking.entity';

@Entity({ name: 'room_booking_slot' })
@Unique(['bookingId', 'timeSlotId'])
@Index(['roomId', 'dateOn', 'timeSlotId'])
export class RoomBookingSlot {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to room booking' })
  @Column({ name: 'booking_id', type: 'bigint' })
  bookingId!: number;

  @ManyToOne(() => RoomBooking, (booking) => booking.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'booking_id' })
  booking!: RoomBooking;

  @ApiProperty({ description: 'Reference to time slot' })
  @Column({ name: 'time_slot_id', type: 'int' })
  timeSlotId!: number;

  @ManyToOne(() => TimeSlot, { eager: true, nullable: false })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot!: TimeSlot;

  @ApiProperty({ description: 'Reference to room for faster conflict checks' })
  @Column({ name: 'room_id', type: 'bigint' })
  roomId!: number;

  @ApiProperty({ type: String, format: 'date' })
  @Column({ name: 'date_on', type: 'date' })
  dateOn!: string;
}
