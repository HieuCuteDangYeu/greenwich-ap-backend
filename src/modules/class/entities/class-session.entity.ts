import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { Room } from '../../room/entities/room.entity';
import { Staff } from '../../staff/entities/staff.entity';
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

  @RelationId((session: ClassSession) => session.class)
  classId!: number;

  @ManyToOne(() => Course, (course) => course.classSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @RelationId((session: ClassSession) => session.course)
  courseId!: number;

  @ApiProperty({ type: String, format: 'date', example: '2024-06-01' })
  @Column({ name: 'date_on', type: 'date' })
  dateOn!: string;

  @ManyToOne(() => Room, (room) => room.sessions, { nullable: false })
  @JoinColumn({ name: 'room_id' })
  room!: Room;

  @RelationId((session: ClassSession) => session.room)
  roomId!: number;

  @ManyToOne(() => Staff, (staff) => staff.classSessions, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Staff;

  @RelationId((session: ClassSession) => session.teacher)
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

  @ManyToMany(() => TimeSlot)
  @JoinTable({
    name: 'class_session_slot',
    joinColumn: { name: 'session_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'slot_id', referencedColumnName: 'id' },
  })
  timeSlots?: TimeSlot[];
}
