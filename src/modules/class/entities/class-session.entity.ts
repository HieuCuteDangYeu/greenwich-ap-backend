import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from './class.entity';
import { Course } from '../../course/entities/course.entity';

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

  @ApiProperty({ description: 'Reference to the class' })
  @Column({ name: 'class_id', type: 'bigint' })
  classId!: number;

  @ManyToOne(() => Class, (cls) => cls.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @ApiProperty({ description: 'Reference to the course' })
  @Column({ name: 'course_id', type: 'bigint' })
  courseId!: number;

  @ManyToOne(() => Course, (course) => course.classSessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @ApiProperty({ type: String, format: 'date' })
  @Column({ name: 'date_on', type: 'date' })
  dateOn!: Date;

  @ApiProperty({
    description: 'Reference to the room where the session occurs',
  })
  @Column({ name: 'room_id', type: 'bigint' })
  roomId!: number;

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
}
