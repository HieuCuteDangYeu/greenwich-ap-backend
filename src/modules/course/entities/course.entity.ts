import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { ClassCourse } from '../../class/entities/class-course.entity';
import { ClassSession } from '../../class/entities/class-session.entity';
import { Department } from '../../department/entities/department.entity';
import { Staff } from '../../staff/entities/staff.entity';
@Entity({ name: 'course' })
export class Course {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @OneToMany(() => ClassCourse, (classCourse) => classCourse.course)
  classCourses: ClassCourse[];

  @OneToMany(() => ClassSession, (session) => session.course)
  classSessions: ClassSession[];

  @ManyToOne(() => Department, { nullable: false })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  // Expose the FK value without mapping the column twice
  @RelationId((c: Course) => c.department)
  departmentId: number;

  @ApiProperty({ description: 'Unique course code' })
  @Column({ length: 20, unique: true })
  code!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @ApiProperty({ required: false })
  @Column({ type: 'integer', nullable: true })
  credits?: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20 })
  level!: string;

  @ApiProperty({ type: () => Staff, required: false })
  @ManyToOne(() => Staff, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacher_id' })
  teacher?: Staff | null;

  @RelationId((course: Course) => course.teacher)
  teacherId?: number | null;

  @ApiProperty({ required: false })
  @Column({ type: 'integer', nullable: true })
  slot?: number;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
