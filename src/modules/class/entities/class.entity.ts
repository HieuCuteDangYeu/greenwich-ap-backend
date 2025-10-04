import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import { ClassCourse } from './class-course.entity';
import { ClassSession } from './class-session.entity';

@Entity({ name: 'class' })
export class Class {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: number;

  @OneToMany(() => Student, (student) => student.class)
  students: Student[];

  @OneToMany(() => ClassCourse, (classCourse) => classCourse.class)
  classCourses: ClassCourse[];

  @OneToMany(() => ClassSession, (session) => session.class)
  sessions: ClassSession[];

  @ApiProperty()
  @Column({ length: 50 })
  name: string;

  @ApiProperty({ required: false })
  @Column({ type: 'int', unsigned: true, nullable: true })
  capacity?: number;

  @ApiProperty({
    enum: ['PLANNING', 'RUNNING', 'CLOSED', 'CANCELLED'],
    default: 'PLANNING',
  })
  @Column({
    type: 'enum',
    enum: ['PLANNING', 'RUNNING', 'CLOSED', 'CANCELLED'],
    default: 'PLANNING',
  })
  status: 'PLANNING' | 'RUNNING' | 'CLOSED' | 'CANCELLED';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
