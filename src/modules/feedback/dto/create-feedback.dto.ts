import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { QuestionType } from '../../../common/enums/question-type.enum';
import { QuestionOption } from '../../../common/types/question-option.enum';

export class QuestionOptionDto implements QuestionOption {
  @ApiProperty({
    description: 'Option value (unique identifier)',
    example: 'ALWAYS_PUNCTUAL',
  })
  @IsString()
  value!: string;

  @ApiProperty({
    description: 'Option label in English',
    example: 'Always punctual',
  })
  @IsString()
  label!: string;

  @ApiProperty({
    description: 'Optional Vietnamese translation',
    example: 'Luôn đúng giờ',
    required: false,
  })
  @IsString()
  @IsOptional()
  labelVi?: string;
}

export class CreateFeedbackQuestionDto {
  @ApiProperty({
    description: 'The feedback question text',
    example: "Regarding the teacher's punctuality",
  })
  @IsString()
  @MinLength(10)
  questionText!: string;

  @ApiProperty({
    description: 'The feedback question text in Vietnamese',
    example: 'Về sự đúng giờ của giảng viên',
    required: false,
  })
  @IsString()
  @IsOptional()
  questionTextVi?: string;

  @ApiProperty({
    enum: QuestionType,
    description: 'Type of question',
    example: QuestionType.MULTIPLE_CHOICE,
    default: QuestionType.MULTIPLE_CHOICE,
  })
  @IsEnum(QuestionType)
  @IsOptional()
  questionType?: QuestionType;

  @ApiProperty({
    description: 'Array of available options for this question',
    type: [QuestionOptionDto],
    example: [
      {
        value: 'ALWAYS_PUNCTUAL',
        label: 'Always punctual',
        labelVi: 'Luôn đúng giờ',
      },
      {
        value: 'MOSTLY_PUNCTUAL',
        label: 'Mostly punctual',
        labelVi: 'Phần lớn đúng giờ',
      },
      {
        value: 'RARELY_PUNCTUAL',
        label: 'Rarely punctual',
        labelVi: 'Ít đúng giờ',
      },
      {
        value: 'NOT_AT_ALL_PUNCTUAL',
        label: 'Not at all punctual',
        labelVi: 'Không đúng giờ',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one option is required' })
  @ValidateNested({ each: true })
  @Type(() => QuestionOptionDto)
  options!: QuestionOptionDto[];

  @ApiProperty({
    description: 'Order of the question in the form',
    example: 1,
    required: false,
  })
  @IsInt()
  @IsOptional()
  questionOrder?: number;

  @ApiProperty({
    description: 'Whether the question is active',
    example: true,
    default: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
