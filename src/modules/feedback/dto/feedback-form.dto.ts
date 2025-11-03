import { ApiProperty } from '@nestjs/swagger';

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

export class StudentFeedbackFormsResponseDto {
  @ApiProperty({
    description: 'List of feedback forms for the student',
    type: [FeedbackFormDto],
  })
  forms!: FeedbackFormDto[];

  @ApiProperty({
    description: 'Active feedback questions',
    type: 'array',
  })
  questions!: Array<{
    id: number;
    questionText: string;
    questionOrder: number;
  }>;
}
