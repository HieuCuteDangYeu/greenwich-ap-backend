import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Room } from '../../room/entities/room.entity';
import { TimeSlot } from '../../time-slot/entities/time-slot.entity';
import { Class } from './class.entity';

export const CLASS_SESSION_STATUS = [
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'RESCHEDULED',
] as const;

export type ClassSessionStatus = (typeof CLASS_SESSION_STATUS)[number];

@Entity({ name: 'class_session' })
export class ClassSession {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ManyToOne(() => Class, (cls) => cls.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @ApiProperty({ description: 'Reference to the class' })
  @RelationId((session: ClassSession) => session.class)
  classId!: number;

  @ManyToOne(() => Course, (course) => course.classSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @ApiProperty({ description: 'Reference to the course' })
  @RelationId((session: ClassSession) => session.course)
  courseId!: number;

  @ApiProperty({
    type: String,
    format: 'date',
    example: '2024-06-01',
  })
  @Column({ name: 'date_on', type: 'date' })
  dateOn!: string;

  @ApiProperty({
    description: 'Reference to the room where the session occurs',
  })
  @Column({ name: 'room_id', type: 'bigint' })
  roomId!: number;

  @ManyToOne(() => Room, (room) => room.sessions, { nullable: false })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @ApiProperty({ description: 'Reference to the teacher in charge' })
  @Column({ name: 'teacher_id', type: 'bigint' })
  teacherId!: number;

  @ApiProperty({
    enum: CLASS_SESSION_STATUS,
    default: 'SCHEDULED',
  })
  @Column({
    type: 'enum',
    enum: CLASS_SESSION_STATUS,
    default: 'SCHEDULED',
  })
  status!: ClassSessionStatus;

  @ManyToOne(() => TimeSlot, (slot) => slot.sessions, { nullable: true })
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot?: TimeSlot | null;
}
