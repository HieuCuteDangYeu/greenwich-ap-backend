import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { CreateStudentDto } from './create-student.dto';
import { UserInStudentDto } from './user-in-student.dto';

export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['user'] as const),
) {
  @ApiPropertyOptional({ type: () => UserInStudentDto })
  @ValidateNested()
  @Type(() => UserInStudentDto)
  @IsOptional()
  user?: UserInStudentDto;

  @ApiPropertyOptional({
    description: 'Current academic year',
    example: null,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, {
    message: 'currentYear must be a number as string, e.g. "1"',
  })
  currentYear?: string;

  @ApiPropertyOptional({
    description: 'Start term (e.g., "Fall 2025")',
    example: null,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(Spring|Summer|Fall)\s+\d{4}$/i, {
    message:
      'startTerm must be like "Spring 2025", "Summer 2025", or "Fall 2025"',
  })
  startTerm?: string;

  @ApiPropertyOptional({
    description: 'End term (e.g., "Summer 2029")',
    example: null,
  })
  @IsOptional()
  @IsString()
  @Matches(/^(Spring|Summer|Fall)\s+\d{4}$/i, {
    message:
      'endTerm must be like "Spring 2025", "Summer 2025", or "Fall 2025"',
  })
  endTerm?: string;
}
