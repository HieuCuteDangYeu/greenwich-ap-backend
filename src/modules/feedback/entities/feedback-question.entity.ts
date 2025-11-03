import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { QuestionType } from '../../../common/enums/question-type.enum';
import { QuestionOption } from '../../../common/types/question-option.enum';
import { QuestionOptionDto } from '../dto/create-feedback.dto';

@Entity({ name: 'feedback_question' })
export class FeedbackQuestion {
  @ApiProperty()
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @ApiProperty({ description: 'The feedback question text' })
  @Column({ name: 'question_text', type: 'varchar', length: 500 })
  questionText!: string;

  @ApiProperty({
    enum: QuestionType,
    description: 'Type of question (multiple choice, rating, yes/no, text)',
    default: QuestionType.MULTIPLE_CHOICE,
  })
  @Column({
    name: 'question_type',
    type: 'varchar',
    length: 50,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  questionType!: QuestionType;

  @ApiProperty({
    description: 'Array of available options for the question',
    type: [QuestionOptionDto],
    isArray: true,
  })
  @Column({ type: 'jsonb' })
  options!: QuestionOption[];

  @ApiProperty({ description: 'Order of the question in the form' })
  @Column({ name: 'question_order', type: 'int', default: 0 })
  questionOrder!: number;

  @ApiProperty({ description: 'Whether the question is active' })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany('FeedbackResponse', 'question')
  responses?: any[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
