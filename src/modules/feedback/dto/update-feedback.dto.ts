import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { QuestionType } from '../../../common/enums/question-type.enum';
import { CreateFeedbackQuestionDto } from './create-feedback.dto';

export class UpdateFeedbackQuestionDto extends PartialType(
  CreateFeedbackQuestionDto,
) {
  @ApiProperty({
    description: 'The text of the feedback question',
    example: 'How would you rate the teaching quality?',
    required: false,
  })
  @IsString()
  @IsOptional()
  questionText?: string;

  @ApiProperty({
    description: 'The text of the feedback question in Vietnamese',
    example: 'Bạn đánh giá chất lượng giảng dạy như thế nào?',
    required: false,
  })
  @IsString()
  @IsOptional()
  questionTextVi?: string;

  @ApiProperty({
    description: 'The type of question',
    enum: QuestionType,
    example: QuestionType.RATING,
    required: false,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiProperty({
    description: 'The display order of the question',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  questionOrder?: number;

  @ApiProperty({
    description: 'Whether the question is active',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
