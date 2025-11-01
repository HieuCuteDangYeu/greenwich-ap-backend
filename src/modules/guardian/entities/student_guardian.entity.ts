import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { Guardian } from './guardian.entity';

@Entity({ name: 'student_guardian' })
export class StudentGuardian {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to student.id' })
  @Column({ name: 'student_id', type: 'bigint', unique: true })
  studentId!: number;

  @ManyToOne(() => Student, { nullable: false })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ApiProperty({ description: 'Reference to guardian.id' })
  @Column({ name: 'guardian_id', type: 'bigint', unique: true })
  guardianId!: number;

  @ManyToOne(() => Guardian, { nullable: false })
  @JoinColumn({ name: 'guardian_id' })
  guardian!: Guardian;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: false })
  relationship!: string;

  @ApiProperty()
  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;
}
