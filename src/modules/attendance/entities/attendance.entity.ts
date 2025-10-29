import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Student } from '../../student/entities/student.entity';
import { ClassSession } from '../../class/entities/class-session.entity';

export const ATTENDANCE_STATUS = ['PRESENT', 'ABSENT', 'PENDING'] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[number];

@Entity({ name: 'attendance' })
export class Attendance {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to student' })
  @Column({ name: 'student_id', type: 'bigint', nullable: false })
  studentId!: number;

  @ManyToOne(() => Student, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ApiProperty({ description: 'Reference to class session' })
  @Column({ name: 'session_id', type: 'bigint', nullable: false })
  sessionId!: number;

  @ManyToOne(() => ClassSession, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session!: ClassSession;

  @ApiProperty({
    enum: ATTENDANCE_STATUS,
    description:
      'Attendance status: PRESENT (attended), ABSENT (did not attend), PENDING (not yet recorded)',
    default: 'PENDING',
  })
  @Column({
    type: 'enum',
    enum: ATTENDANCE_STATUS,
    default: 'PENDING',
  })
  status!: AttendanceStatus;

  @ApiProperty({
    description: 'Optional note about attendance',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  note?: string | null;

  @ApiProperty({ description: 'Timestamp when attendance was recorded' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @ApiProperty({ description: 'Timestamp when attendance was last updated' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
