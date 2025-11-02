import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Class } from '../../class/entities/class.entity';
import { Course } from '../../course/entities/course.entity';
import { Staff } from '../../staff/entities/staff.entity';
import { Student } from '../../student/entities/student.entity';
import { Term } from '../../term/entities/term.entity';
import { FeedbackQuestion } from './feedback-question.entity';

@Entity({ name: 'feedback_response' })
export class FeedbackResponse {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'Student giving feedback' })
  @Column({ name: 'student_id', type: 'bigint' })
  studentId!: number;

  @ManyToOne(() => Student, { eager: false })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @ApiProperty({ description: 'Teacher being evaluated' })
  @Column({ name: 'staff_id', type: 'bigint' })
  staffId!: number;

  @ManyToOne(() => Staff, { eager: false })
  @JoinColumn({ name: 'staff_id' })
  staff!: Staff;

  @ApiProperty({ description: 'Course being taught' })
  @Column({ name: 'course_id', type: 'bigint' })
  courseId!: number;

  @ManyToOne(() => Course, { eager: false })
  @JoinColumn({ name: 'course_id' })
  course!: Course;

  @ApiProperty({ description: 'Class reference' })
  @Column({ name: 'class_id', type: 'bigint' })
  classId!: number;

  @ManyToOne(() => Class, { eager: false })
  @JoinColumn({ name: 'class_id' })
  class!: Class;

  @ApiProperty({ description: 'Term reference' })
  @Column({ name: 'term_id', type: 'bigint' })
  termId!: number;

  @ManyToOne(() => Term, { eager: false })
  @JoinColumn({ name: 'term_id' })
  term!: Term;

  @ApiProperty({ description: 'Question reference' })
  @Column({ name: 'question_id', type: 'bigint' })
  questionId!: number;

  @ManyToOne(() => FeedbackQuestion, (q) => q.responses, { eager: false })
  @JoinColumn({ name: 'question_id' })
  question!: FeedbackQuestion;

  @ApiProperty({
    description:
      "Selected option value (must match one of the question's defined options)",
    example: 'ALWAYS_PUNCTUAL',
  })
  @Column({
    name: 'selected_option',
    type: 'varchar',
    length: 255,
  })
  selectedOption!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
