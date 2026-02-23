import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from '../../room/entities/room.entity';
import { User } from '../../user/entities/user.entity';
import { RoomBookingSlot } from './room-booking-slot.entity';

export const BOOKING_STATUS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const;

export type BookingStatus = (typeof BOOKING_STATUS)[number];

@Entity({ name: 'room_booking' })
export class RoomBooking {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to the room' })
  @Column({ name: 'room_id', type: 'bigint' })
  roomId!: number;

  @ManyToOne(() => Room, { nullable: false })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @ApiProperty({ description: 'User who requested the booking' })
  @Column({ name: 'requester_user_id', type: 'bigint' })
  requesterUserId!: number;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'requester_user_id' })
  requesterUser!: User;

  @ApiProperty({ type: String, format: 'date' })
  @Column({ name: 'date_on', type: 'date' })
  dateOn!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  purpose?: string | null;

  @ApiProperty({ enum: BOOKING_STATUS, default: 'PENDING' })
  @Column({
    type: 'enum',
    enum: BOOKING_STATUS,
    default: 'PENDING',
  })
  status!: BookingStatus;

  @OneToMany(() => RoomBookingSlot, (slot) => slot.booking)
  slots!: RoomBookingSlot[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
