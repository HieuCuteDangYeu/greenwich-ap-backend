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
import { Class } from '../../class/entities/class.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'student' })
export class Student {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Reference to user account' })
  @Column({ name: 'user_id', type: 'bigint', nullable: false })
  userId!: number;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Class, (c) => c.students, { nullable: true })
  @JoinColumn({ name: 'class_id' })
  class?: Class;

  @ApiProperty({ description: 'Class (Class reference)', required: false })
  @Column({ name: 'class_id', type: 'bigint', nullable: true })
  classId?: number | null;

  @ApiProperty()
  @Column({
    name: 'student_code',
    type: 'varchar',
    length: 30,
    unique: true,
    nullable: false,
  })
  studentCode!: string;

  @ApiProperty({ description: 'Enrolment Day' })
  @Column({ name: 'enrolment_day', type: 'date', nullable: false })
  enrolmentDay!: Date;

  @ApiProperty({ description: 'Mentor (Staff reference)', required: false })
  @Column({ name: 'mentor_id', type: 'bigint', nullable: true })
  mentorId?: number | null;

  @ManyToOne(() => Staff, { eager: false, nullable: true })
  @JoinColumn({ name: 'mentor_id' })
  mentor?: Staff | null;

  @ApiProperty()
  @Column({ type: 'varchar', length: 150, nullable: false })
  faculty!: string;

  @ApiProperty({
    enum: ['ENROLLED', 'SUSPENDED', 'GRADUATED', 'DROPPED', 'OTHER'],
  })
  @Column({
    type: 'enum',
    enum: ['ENROLLED', 'SUSPENDED', 'GRADUATED', 'DROPPED', 'OTHER'],
    default: 'ENROLLED',
  })
  status!: 'ENROLLED' | 'SUSPENDED' | 'GRADUATED' | 'DROPPED' | 'OTHER';

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, nullable: false })
  currentYear!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, nullable: false })
  startTerm!: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 20, nullable: false })
  endTerm!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
