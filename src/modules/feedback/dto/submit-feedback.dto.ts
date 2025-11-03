import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class FeedbackAnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  questionId!: number;

  @ApiProperty({
    description:
      "Selected option value (must match one of the question's options)",
    example: 'ALWAYS_PUNCTUAL',
  })
  @IsString()
  selectedOption!: string;
}

export class SubmitFeedbackDto {
  @ApiProperty({
    description: 'Staff (teacher) ID being evaluated',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  staffId!: number;

  @ApiProperty({
    description: 'Course ID',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  courseId!: number;

  @ApiProperty({
    description: 'Class ID',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  classId!: number;

  @ApiProperty({
    description: 'Term ID',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  termId!: number;

  @ApiProperty({
    description: 'Array of answers to feedback questions',
    type: [FeedbackAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeedbackAnswerDto)
  answers!: FeedbackAnswerDto[];

  @ApiProperty({
    description: 'Additional notes/remarks/suggestions for improvement',
    example: 'Ghi chú - Đề  nghị cải thiện',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
