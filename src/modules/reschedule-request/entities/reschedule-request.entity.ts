import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ClassSession } from '../../class/entities/class-session.entity';
import { Room } from '../../room/entities/room.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { TimeSlot } from '../../time-slot/entities/time-slot.entity';

export const RESCHEDULE_STATUS = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
] as const;

export type RescheduleStatus = (typeof RESCHEDULE_STATUS)[number];

@Entity({ name: 'reschedule_request' })
export class RescheduleRequest {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Class session to reschedule' })
  @Column({ name: 'session_id', type: 'bigint' })
  sessionId!: number;

  @ManyToOne(() => ClassSession, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: ClassSession;

  @ApiProperty({ description: 'Teacher who requested reschedule' })
  @Column({ name: 'requested_by_teacher_id', type: 'bigint' })
  requestedByTeacherId!: number;

  @ManyToOne(() => Staff, { nullable: false })
  @JoinColumn({ name: 'requested_by_teacher_id' })
  requestedByTeacher!: Staff;

  @ApiProperty({ type: String, format: 'date' })
  @Column({ name: 'new_date_on', type: 'date' })
  newDateOn!: string;

  @ApiProperty({ description: 'New time slot' })
  @Column({ name: 'new_time_slot_id', type: 'int' })
  newTimeSlotId!: number;

  @ManyToOne(() => TimeSlot, { eager: true, nullable: false })
  @JoinColumn({ name: 'new_time_slot_id' })
  newTimeSlot!: TimeSlot;

  @ApiProperty({ description: 'New room' })
  @Column({ name: 'new_room_id', type: 'bigint' })
  newRoomId!: number;

  @ManyToOne(() => Room, { eager: true, nullable: false })
  @JoinColumn({ name: 'new_room_id' })
  newRoom!: Room;

  @ApiProperty({ required: false })
  @Column({ type: 'text', nullable: true })
  reason?: string | null;

  @ApiProperty({ enum: RESCHEDULE_STATUS, default: 'PENDING' })
  @Column({
    type: 'enum',
    enum: RESCHEDULE_STATUS,
    default: 'PENDING',
  })
  status!: RescheduleStatus;

  @ApiProperty({ required: false })
  @Column({ name: 'reviewed_by_staff_id', type: 'bigint', nullable: true })
  reviewedByStaffId?: number | null;

  @ManyToOne(() => Staff, { nullable: true })
  @JoinColumn({ name: 'reviewed_by_staff_id' })
  reviewedByStaff?: Staff | null;

  @ApiProperty({ required: false })
  @Column({ name: 'review_note', type: 'text', nullable: true })
  reviewNote?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
