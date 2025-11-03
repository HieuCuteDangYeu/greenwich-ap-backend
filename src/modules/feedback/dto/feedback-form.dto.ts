import { ApiProperty } from '@nestjs/swagger';
import { QuestionType } from '../../../common/enums/question-type.enum';
import { QuestionOption } from '../../../common/types/question-option.enum';

export class FeedbackFormDto {
  @ApiProperty({
    description: 'Staff (teacher) ID',
    example: 1,
  })
  staffId!: number;

  @ApiProperty({
    description: 'Teacher name',
    example: 'Instructor: Nguyen Duc Son',
  })
  teacherName!: string;

  @ApiProperty({
    description: 'Staff code',
    example: 'TDR01002',
  })
  staffCode!: string;

  @ApiProperty({
    description: 'Course ID',
    example: 1,
  })
  courseId!: number;

  @ApiProperty({
    description: 'Course name',
    example: 'Design Research Project',
  })
  courseName!: string;

  @ApiProperty({
    description: 'Class code',
    example: 'Class: TDR01002',
  })
  classCode!: string;

  @ApiProperty({
    description: 'Class ID',
    example: 1,
  })
  classId!: number;

  @ApiProperty({
    description: 'Term ID',
    example: 1,
  })
  termId!: number;

  @ApiProperty({
    description: 'Whether feedback has been submitted',
    example: false,
  })
  isSubmitted!: boolean;
}

export class FeedbackQuestionDto {
  @ApiProperty({
    description: 'Question ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'The text of the feedback question',
    example: "Regarding the teacher's punctuality",
  })
  questionText!: string;

  @ApiProperty({
    description: 'The text of the feedback question in Vietnamese',
    example: 'Về sự đúng giờ của giảng viên',
    required: false,
  })
  questionTextVi?: string;

  @ApiProperty({
    description: 'The type of question',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  questionType!: QuestionType;

  @ApiProperty({
    description: 'The display order of the question',
    example: 1,
  })
  questionOrder!: number;

  @ApiProperty({
    description: 'Available options for the question',
    type: 'array',
    example: [
      {
        value: 'ALWAYS_PUNCTUAL',
        label: 'Always punctual',
        labelVi: 'Luôn đúng giờ',
      },
    ],
  })
  options!: QuestionOption[];
}

export class StudentFeedbackFormsResponseDto {
  @ApiProperty({
    description: 'List of feedback forms for the student',
    type: [FeedbackFormDto],
  })
  forms!: FeedbackFormDto[];

  @ApiProperty({
    description: 'Active feedback questions',
    type: [FeedbackQuestionDto],
  })
  questions!: FeedbackQuestionDto[];
}
